<template>
  <div class="moveBar"></div>
  <div class="main-content" ref="mainContent">
    <!-- 左侧导航栏 -->
    <div class="group-content">
      <!-- <span class="title-name">快捷操作</span> -->
      <div class="operate-area">
        <SettingOutlined @click="showSettingPage=!showSettingPage" :class="{active:showSettingPage}"/>
        <AppstoreAddOutlined/>
        <RollbackOutlined @click="router.push('/')" />
      </div>
      <div v-if="showSettingPage">
        <Setting/>
      </div>
      <div v-else style="height: 100%">
        <a-divider style="margin: 0;"><span style="font-size: small">menu</span></a-divider>
        <div class="group-menu">
          <a-menu
            id="dddddd"
            v-model:openKeys="menuOpenKeys"
            v-model:selectedKeys="menuSelectedKeys"
            style="width: 100%"
            mode="inline"
            :items="menuItems"
            @click="menuClick"
          ></a-menu>
        </div>
        <a-divider  style="margin: 0"><span style="font-size: small">group</span></a-divider>
        <div class="group-list" ref="groupListDiv">
          <a-list size="small" bordered :data-source="groupList" :split="false" style="border: none" :locale="{emptyText: '无群组'}">
            <template #renderItem="{ item }">
              <div :class="{'group-list-item':true, 'selected':groupSelectedKeys[0] === item.uuid}" @mouseenter="showDeleteGroup(item.uuid)" @mouseleave="hideDeleteGroup(item.uuid)" @click="selectedGroup(item)" @dragover="onDragOver" @drop="dropNote($event, item.uuid)" >
                <a-list-item  class="groupList-item" :contenteditable="editGroup">
                  <div style="margin: 0 5px"><AppstoreOutlined/></div>
                  <div style="display: flex; flex-direction: row">
                    <div class="itemList-title">{{ item.name }}</div>
                  </div>
                  <div style="margin-left: auto" v-if="item.uuid === hoverGroup" >
                    <a-tooltip>
                      <a-popover v-model:open="visible" trigger="click" placement="right">
                        <template #content>
                          <a-input v-model:value="editGroupName" size="small" @keydown.enter="saveGroup(item)" @blur="saveGroup(item)"></a-input>
                        </template>
                        <a-button @click.stop=" groupNameCli(item)" style="font-size: 12px; margin: -10px; padding: 4px" type="normal" shape="circle" :icon="h(FormOutlined)" />
                      </a-popover>
                      <!-- <a-button @click.stop="editGroupCli(item)" style="font-size: 12px; margin: -10px; padding: 4px" type="normal" shape="circle" :icon="h(FormOutlined)" /> -->
                      <a-popover v-model:open="visibleDel" trigger="click" placement="right">
                        <template #content>
                          <a-button @click="deleteGroup(item)" size="small">确定?</a-button>
                        </template>
                        <a-button @click.stop="visibleDel = !visibleDel" style="font-size: 12px; margin: 0; padding: 4px" type="normal" shape="circle" :icon="h(CloseCircleOutlined)" />
                      </a-popover>
                    </a-tooltip>
                  </div>
                </a-list-item>
              </div>
            </template>
          </a-list>
        </div>
        <div class="add-button">
          <a-button @click="addGroup">
            <AppstoreAddOutlined/>
          </a-button>
        </div>
      </div>

    </div>
    <!-- 搜索和list -->
    <div class="item-content">
      <a-input style="width: 254px;margin-top: 10px;" v-model:value="keyword" size="small" @keydown.enter="searchList">
        <template #suffix>
          <PlusCircleOutlined @click="openNewEdit" />
        </template>
      </a-input>
      <a-list  class="main-list" size="small" bordered :data-source="noteList" :split="false" style="border: none" :locale="{emptyText: '暂无数据'}">
        <template #renderItem="{ item }">
          <div class="main-list-item" draggable="true" @dragstart="onDragStartNote($event,item)" @mouseenter="showDelete(item.uuid)" @mouseleave="hoverItem = ''" @click="openEdit(item)">
            <a-list-item   :class="{'list-item':true,'selectedNote':editNote.uuid === item.uuid}">
              <div style="display: flex; flex-direction: row">
                <div class="itemList-title">{{ item.title }}</div>
                <!-- <div class="itemList-content" >{{ item.content }}</div> -->
              </div>
              <div class="list-item-time">
                <span v-show="item.uuid !== hoverItem">{{ item.createtime.slice(-8) }}</span>
                <a-tooltip v-if="item.uuid === hoverItem" >
                  <a-button @click.stop="deleteNote(item)" size="small" type="normal" shape="circle" :icon="h(CloseCircleOutlined)" />
                  <a-button @click.stop="removeGroup(item)" size="small" type="normal" shape="circle" :icon="h(MinusCircleOutlined)" />
                </a-tooltip>
              </div>
            </a-list-item>
          </div>
        </template>
      </a-list>
    </div>
    <!-- 编辑栏 -->
    <div class="edit-div">
      <div v-if="editNote.title || editNote.content">
        <div class="edit-title">
          <a-input ref="editTitle" @blur="saveNote" style="font: italic small-caps bold 16px/1.5 " v-model:value="editNote.title" :bordered="false" placeholder="标题" />
        </div>
        <a-divider  style="margin: 0"></a-divider>
        <a-textarea  @blur="saveNote" class="edit-content" v-model:value="editNote.content" placeholder="编辑内容" spellcheck="false" :rows="24" />
      </div>
      <div v-else class="deit-default">
        <span><EditOutlined @click="openNewEdit" /></span>
        <span>编辑区</span> 
      </div>
    </div>
  </div>

</template>
  
  <script setup>
import { ref, reactive, watch,computed, onMounted, onBeforeUnmount, h } from "vue";
import { useRouter } from 'vue-router';
import { MinusCircleOutlined, FormOutlined,SettingOutlined,
  AppstoreOutlined, AppstoreAddOutlined, BlockOutlined,
  PlusCircleOutlined,EditOutlined, CloseCircleOutlined,RollbackOutlined } from '@ant-design/icons-vue'
import  Setting  from "./Setting.vue";
import "../style/main.less";



// data
const router = useRouter();
let noteList = reactive([])
const menuOpenKeys = ref(['allNote']);
const menuSelectedKeys = ref(['allNote']);
const groupOpenKeys = ref(['1']);
const groupSelectedKeys = ref(['sub1']);
const groupListDiv = ref(null)
let hoverItem = ref('')
let hoverGroup = ref('')
let keyword = ref('')
let listType = reactive({
  type: 'allNote',
  groupUUID: ''
})
let editGroupUUID = ref('')
let editNote = reactive({
  content: '',
  title: '',
  uuid: '',
  groupuuid: '',
  createtime: '',
})
let groupList = reactive([])
let visible = ref(false)
let visibleDel = ref(false)
let editGroupName = ref('')
let editTitle = ref(null)
let showSettingPage = ref(false)

const getItem = (label, key, icon, children, type) => {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}
// const items2 = reactive([
//   {key: 'item', label: 'label', key: 'key 1', icon: 'icon 1', children: [], type: 'type 11'}
// ])
const menuItems = reactive([
  getItem('所有片段', 'allNote', () => h(AppstoreOutlined), null, 'allNote'),
  getItem('未分类', 'unGroup', () => h(BlockOutlined), null, 'unGroup')
]);
// methods
const searchList = async () => {
  const list = await window.electron.search({name:'getNoteSearch', params: {keyword: `%${keyword.value}%`}})
  console.log('list:::::', list);
  noteList.length = 0
  noteList.push(...list)
}
const groupNameCli = (item) => {
  visible.value = !visible
  editGroupName.value = item.name
}
const addGroup = () => {
  groupList.push({
    name: '',
    uuid: '',
    createtime: '',
    no: 0
  })
  if (groupListDiv.value) {
    setTimeout(() => {
      groupListDiv.value.scrollTo({
        top: groupListDiv.value.scrollHeight, // 滚动到最底部
        behavior: 'smooth', // 平滑滚动
      });
    }, 200);
  }
}

const menuClick = (menu) => {
  groupSelectedKeys.value.length = 0
  groupOpenKeys.value.length = 0
  listType.type = menu.key
  refreshList()
}

const selectedGroup = (group) => {
  listType.type = 'group'
  listType.key = group.uuid
  groupSelectedKeys.value.length = 0
  groupSelectedKeys.value.push(group.uuid)
  menuOpenKeys.value.length = 0
  menuSelectedKeys.value.length = 0
  console.log(123);
  
  refreshList()
}

const saveGroup = async (group) => {
  visible.value = false
  if (!editGroupName.value) return
  group.name = editGroupName.value
  // editGroupName.value = ''
  if (group.uuid) {
    const newGroup = await window.electron.saveGroup({...group})
  } else {
    const newGroup = await window.electron.addGroup({...group})
    getGroupList()
  }
  editGroupName.value = ''
}

const deleteGroup = async (group) => {
  visibleDel.value = false
  if (group.uuid) {
    await window.electron.deleteGroup(group.uuid)
    const index = groupList.findIndex(item => item.uuid === group.uuid)
    groupList.splice(index, 1)
  } else {
    groupList.pop()
  }
}

const editGroupCli = () => {
  editGroupUUID.value = hoverGroup.value
}

const showDelete = (noteUUID) => {
  hoverItem.value = noteUUID
}
const showDeleteGroup = (groupUUID) => {
  hoverGroup.value = groupUUID
  visible.value = false
  visibleDel.value = false
}
const hideDeleteGroup = () => {
  // hoverGroup.value = ''
  editGroupUUID.value = ''
}
const refreshList = async () => {
  noteList.length = 0
  let list = []
  if (listType.type === 'allNote') {
    list = await window.electron.getAllNote()
  } else if (listType.type === 'unGroup') {
    list = await window.electron.getUngroupNote()
  } else if (listType.type === 'group') {
    list = await window.electron.getGroupNote(listType.key)
  }
  
  noteList.push(...list)
}


// 打开新的编辑
const openNewEdit = () => {
  editNote.content = ''
  editNote.title = '标题'
  editNote.groupUUID = ''
  editNote.createtime = ''
  editNote.uuid = ''
  setTimeout(() => {
    editTitle.value?.focus()
  }, 100);
}
// 添加笔记
const openEdit = (note) => {
  editNote.content = note.content
  editNote.title = note.title
  editNote.groupUUID = note.groupUUID
  editNote.createtime = note.createtime
  editNote.uuid = note.uuid
}
const saveNote = async () => {
  if (!editNote.content || !editNote.title) return
  const note = {...editNote}
  // 新增/更新
  if (!editNote.uuid) {
    const result = await window.electron.addNote(note)
    editNote.uuid = result.uuid
    editNote.createtime = result.createtime
  } else {
    const result = await window.electron.saveNote(note)
  }
  refreshList()
}
const deleteNote = async (note) => {
  await window.electron.deleteNote(note.uuid)
  refreshList()
  if (note.uuid === editNote.uuid) {
    openNewEdit()
    editNote.title = ''
  }
}

const removeGroup = async (note) => {
  if (!note.groupuuid) return
  await window.electron.removeGroup(note.uuid)
  refreshList()
}

const onDragStartNote = (event, note) => {
  event.dataTransfer.setData('noteUUID', note.uuid)
}
const onDragOver = (event) => {
  event.preventDefault() // 必须阻止默认行为，否则drop事件不会触发
}

const dropNote = async (event, groupuuid) => {
  const noteuuid = event.dataTransfer.getData('noteUUID')
  await window.electron.groupTo({noteuuid, groupuuid})
  refreshList()
}

// 监听键盘按下事件
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    // 跳转到 Home 页面
    router.push('/');
  }
};

const backHome = () => {
  router.push('/')
}

const getGroupList = async () => {
  groupList.length = 0
  const list = await window.electron.getGroupList()
  groupList.push(...list)
}

// 计算属性
const editGroup = computed(() => {
  return editGroupUUID.value === hoverGroup.value
});

onMounted(() => {
  refreshList()
  getGroupList()
});

onBeforeUnmount(() => {
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.electron.resizeWindow({width: 1000, height: 620})
})

// 在组件卸载前移除事件监听器
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});



</script>
  
<style scoped  lang="less">
.main-content {
  display: flex;
  flex-direction: row;
  margin: 0 auto;
  width: 1000px;
  height: 600px;
  .group-content {
    display: flex;
    flex-direction: column;
    width: 17%;
    height: 100%;
    min-width: 100px;
    .title-name {
      font-size: small;
      align-self:auto;
      margin: 0.3em 0;
    }
    .group-menu {
      margin: 0.3em 0;
      border-radius: 10px;
    }
    .add-button {
      margin-top: auto;
      margin-bottom: 7px;
    }
  }

  .item-content {
    width: 27%;
    margin: 5px 2px;
    background-color: #f0f5ff;
    .main-list {
      height: 95%;
      overflow: auto;
      &::-webkit-scrollbar {
        width: 0px;  /* 隐藏垂直滚动条 */
        height: 0px;  /* 隐藏水平滚动条 */
      }
      margin: 4px;
      .main-list-item{
        border-radius: 6px;
        :hover {
          background-color: #c2d5ff;
        }
      }
    }
  }
  // -webkit-app-region: drag;
}

.group-list {
  margin: 0.3em 0;
  border-radius: 10px;
  height: 64%;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 0px;  /* 隐藏垂直滚动条 */
    height: 0px;  /* 隐藏水平滚动条 */
  }
  .group-list-item {
    border-radius: 7px;
    margin: 4px 0;
    // padding: 2px;
    :hover {
      background-color: #f0f0f0;
      border-radius: 7px;
    }
    .groupList-item {
      cursor: default;
      display: flex;
      justify-content: start;
      height: 32px;
      margin-right: 0;
      padding-right: 0;
      padding-left: 0;
      div {
        margin-left: 4px;
      }
    }
    
    .itemList-title {
      margin-right: 1em;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      max-width: 9em;
      font-size: 1em;
    }
    
    &:hover {
      .itemList-title {
        max-width: 5em;
      }
    }
  }
}

.selected {
  background-color: #e6f4ff !important;
  :hover {
    background-color: #e6f4ff !important;
  }
}
.selectedNote {
  background-color: #c2d5ff !important;
  :hover {
    background-color: #c2d5ff !important;
  }
}
.list-item {
  padding-right: 0;
  background-color: #dfe4f9;
  border-radius: 6px;
  margin: 4px;
  display: flex;
  flex-direction: row;
  justify-content:space-between;
  height: 34px;
  span {
    font-size: 0.8em;
  }
  .itemList-title {
    margin-right: 1em;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 11em;
    font-size: 1em;
  }
  .itemList-content {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 6em;
    font-size: 1em;
  }
  .list-item-time {
    display: flex;
    flex-direction: row;
    justify-content: center;
    /* align-self: auto; */
    align-items: center;
    font-size: 0.8em;
  }
}
.edit-div {
  width: 51%;
  height: 100%;
  input {
    font:  bold 1.5em/1.5 'Arial', sans-serif;
  }
  .edit-content {
    margin: 6px;
    width: 100%;
    border: none;
  }
  .deit-default {
    width: 100%;
    height: 100%;
    margin: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center; /* 垂直居中 */
    span {
      font: 0.8em/0.3 'Arial', sans-serif;
      margin: 5px 1px;
    }
    span:first-child {
      font: 1.5em/0.3 'Arial', sans-serif;
    }
  }
}
input, textarea {
  spellcheck: false;
}

.operate-area {
  display: flex;
  justify-content: space-around;
  margin: 5px 3px;
  :hover {
    color: #437fff;
  }
  .active {
    color: #437fff;
  }
}

</style>
  