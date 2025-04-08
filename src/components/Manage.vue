<template>
  <div class="moveBar"></div>
  <div class="main-content" ref="mainContent">
    <!-- 左侧导航栏 -->
    <div class="group-content">
      <!-- <span class="title-name">快捷操作</span> -->
      <div class="operate-area">
        <SettingOutlined @click="changeLeft('setting')" :class="{active:leftPage === 'setting'}"/>
        <AppstoreAddOutlined/>
        <RollbackOutlined @click="router.push('/')" />
      </div>
      <div v-show="leftPage ==='setting'">
        <Setting @unlockPwd="unlockPwd"/>
      </div>
      <div v-show="leftPage === 'menu'" style="height: 100%">
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
      <!-- note列表 -->
      <NoteList v-if="listType.type !== 'password'" :dataList="noteList" @clickItem="openEdit($event, 'note')">
        <template #content="{item}">
          <a-button @click.stop="deleteNote(item)" size="small" type="normal" shape="circle" :icon="h(CloseCircleOutlined)" />
          <a-button @click.stop="removeGroup(item)" size="small" type="normal" shape="circle" :icon="h(MinusCircleOutlined)" />
        </template>
      </NoteList>
      <!-- 密码列表 -->
      <NoteList v-if="listType.type === 'password'" :dataList="pwdList" @clickItem="openEdit($event, 'password')">
        <template #content="{item}">
          <a-button @click.stop="delPwd(item)" size="small" type="normal" shape="circle" :icon="h(CloseCircleOutlined)" />
        </template>
      </NoteList>
    </div>
    <!-- 编辑栏 -->
    <div class="edit-div">
      <div v-if="editShow === 'note'">
        <div class="edit-title">
          <a-input ref="editTitle" @blur="saveNote" style="font: bold 1.5em/1.5 'Arial', sans-serif" v-model:value="editNote.title" :bordered="false" placeholder="标题" />
        </div>
        <a-divider  style="margin: 0"></a-divider>
        <a-textarea  @blur="saveNote" class="edit-content" v-model:value="editNote.content" placeholder="编辑内容" spellcheck="false" :rows="24" />
      </div>
      <div v-if="editShow === 'password'">
        <a-input ref="editTitle" @blur="savePwd" style="font: bold 1.5em/1.5 'Arial', sans-serif " v-model:value="editPwd.name" :bordered="false" placeholder="标题" />
        <a-divider  style="margin: 0"></a-divider>
        <div class="pwd-item">
          <div class="pwdItem-title"><span>用户名:</span></div>
          <a-input @blur="savePwd" style="font: italic small-caps bold 10px/1 " v-model:value="editPwd.username" :bordered="false" placeholder="账号" />
        </div>
        <a-divider  style="margin: 0"></a-divider>
        <div class="pwd-item">
          <div class="pwdItem-title"><span>密码:</span></div>
          <a-input @blur="savePwd" style="font: italic small-caps bold 10px/1 " v-model:value="editPwd.password" :bordered="false" placeholder="密码" />
        </div>
        <a-divider  style="margin: 0"></a-divider>
        <div class="pwd-item">
          <div class="pwdItem-title"><span>email:</span></div>
          <a-input @blur="savePwd" style="font: italic small-caps bold 10px/1 " v-model:value="editPwd.email" :bordered="false" placeholder="email" />
        </div>
        <a-divider  style="margin: 0"></a-divider>
        <div class="pwd-item">
          <div class="pwdItem-title"><span>电话号码:</span></div>
          <a-input @blur="savePwd" style="font: italic small-caps bold 10px/1 " v-model:value="editPwd.phonenumber" :bordered="false" placeholder="电话号码" />
        </div>
        <a-divider  style="margin: 0"></a-divider>
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
  AppstoreOutlined, AppstoreAddOutlined, BlockOutlined,LockOutlined,KeyOutlined,
  PlusCircleOutlined,EditOutlined, CloseCircleOutlined,RollbackOutlined } from '@ant-design/icons-vue'
import  Setting  from "./Setting.vue";
import "../style/main.less";
import NoteList from "./module/NoteList.vue";
import utils from "../js/utils";



// data
const router = useRouter();
let noteList = reactive([])
const menuOpenKeys = ref(['allNote']);
const menuSelectedKeys = ref(['allNote']);
const groupOpenKeys = ref(['1']);
const groupSelectedKeys = ref(['sub1']);
const groupListDiv = ref(null)
let leftPage = ref('menu')
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
let editPwd = reactive({
  uuid: '',
  name: '',
  username: '',
  password: '',
  remark: '',
  phonenumber: '',
  email: '',
  createtime:'',
})
let groupList = reactive([])
let visible = ref(false)
let visibleDel = ref(false)
let editGroupName = ref('')
let editTitle = ref(null)
let showSettingPage = ref(false)
let pwdList = ref([])
let editShow = ref('')

const getItem = (label, key, icon, children, type, disabled) => {
  return {
    key,
    icon,
    children,
    label,
    type,
    disabled: false,
  };
}
const changeLeft = (type) => {
   leftPage.value = leftPage.value === type? 'menu' : type
}
const unlockPwd = async (unlock) => {
  const pwdMenu = menuItems.find(item => item.key === 'password')
  pwdMenu.disabled = !unlock
}
const delPwd = async (pwd) => {
  await window.electron.delPwd({uuid:pwd.uuid})
  refreshList()
  if (pwd.uuid === editPwd.uuid) {
    openNewEdit()
    editShow.value = ''
  }
}
const savePwd = async () => {
  if (!editPwd.name) return
  const pwd = {...editPwd}
  if (!editPwd.uuid) {
    const result = await window.electron.addPwd(pwd)
    editPwd.uuid = result.uuid
    editPwd.createtime = result.createtime
  } else {
    await window.electron.savePwd(pwd)
  }
  refreshList()
}
const menuItems = reactive([
  getItem('所有片段', 'allNote', () => h(AppstoreOutlined), null, 'allNote'),
  getItem('未分类', 'unGroup', () => h(BlockOutlined), null, 'unGroup'),
  getItem('密码', 'password', () => h(KeyOutlined), null, 'password', true)
]);
// methods
const searchList = async () => {
  if(listType.type === 'password') {
    const params ={
      name: 'getPwdSearch',
      decrypt: [['password','password']],
      params: {
        keyword:`%${keyword.value}%`
      }
    }
    const list = await window.electron.search(params)
    pwdList.value = list
    return
  }
  const list = await window.electron.search({name:'getNoteSearch', params: {keyword: `%${keyword.value}%`}})
  noteList.length = 0
  noteList.push(...list)
}
const groupNameCli = (item) => {
  visible.value = !visible
  editGroupName.value = item.name
}
const addGroup = () => {
  if (!groupList[groupList.length-1].uuid) return
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
  keyword.value = ''
  resetEdit('note')
  resetEdit('password')
  editShow.value = ''
}

const selectedGroup = (group) => {
  listType.type = 'group'
  listType.key = group.uuid
  groupSelectedKeys.value.length = 0
  groupSelectedKeys.value.push(group.uuid)
  menuOpenKeys.value.length = 0
  menuSelectedKeys.value.length = 0
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
const removeGroup = async (note) => {
  if (!note.groupuuid) return
  
  await window.electron.removeGroup(note.uuid)
  refreshList()
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
  } else if (listType.type === 'password') {
    pwdList.value = await window.electron.getPwdList()
  }
  noteList.push(...list)
}


// 打开新的编辑
const openNewEdit = () => {
  if (listType.type === 'password') {
    editShow.value = 'password'
    resetEdit('password')
  } else {
    editShow.value = 'note'
    resetEdit('note')
    setTimeout(() => {
      editTitle.value?.focus()
    }, 100);
  }
}
// 添加笔记
const openEdit = (note, type) => {
  editShow.value = type
  resetEdit(type, note)
}
const resetEdit = (type, params) => {
  if (type === 'note') {
    if (!params) {
      editNote.content = ''
      editNote.title = ''
      editNote.groupUUID = ''
      editNote.createtime = ''
      editNote.uuid = ''
    } else {
      editNote.content = params.content
      editNote.title = params.title
      editNote.groupUUID = params.groupUUID
      editNote.createtime = params.createtime
      editNote.uuid = params.uuid
    }
  } else if (type === 'password') {
    if (!params) {
      editPwd.uuid= ''
      editPwd.name= ''
      editPwd.username= ''
      editPwd.password= ''
      editPwd.remark= ''
      editPwd.phonenumber= ''
      editPwd.email= ''
      editPwd.createtime= ''
    } else {
      editPwd.uuid= params.uuid
      editPwd.name= params.name
      editPwd.username= params.username
      editPwd.password= params.password
      editPwd.remark= params.remark
      editPwd.phonenumber= params.phonenumber
      editPwd.email= params.email
      editPwd.createtime= params.createtime
    }
  }
}
const saveNote = async () => {
  if (!editNote.title) return
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
    editShow.value = ''
  }
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
  window.electron.resizeWindow([1000,620])
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
  width: 100%;
  height: 600px;
  .group-content {
    min-width: 167px;
    display: flex;
    flex-direction: column;
    width: 17%;
    height: 100%;
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
    min-width: 265px;
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
.pwd-item {
  display: flex;
  margin-top: 1em;
  .pwdItem-title {
    margin: auto 1em;
    white-space: nowrap;       /* 禁止换行 */
    font: bold 1em/1.5 'Arial', sans-serif ;
    color: #6d6d6d;
  }
}
</style>
  