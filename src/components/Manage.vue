<template>
  <div class="move-div"></div>
  <div class="main-content" ref="mainContent">
    <div class="group-content">
      <!-- <span class="title-name">快捷操作</span> -->
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
      <div class="group-list">
        <a-menu
          id="dddddd"
          v-model:openKeys="groupOpenKeys"
          v-model:selectedKeys="groupSelectedKeys"
          style="width: 100%"
          mode="inline"
          :items="groupItems"
          @click="groupClick"
        ></a-menu>
      </div>
      <div class="add-button"><a-button><AppstoreAddOutlined/></a-button></div>
    </div>
    <div class="item-content">
      <a-input v-model="keyword" size="small">
        <template #suffix>
          <PlusCircleOutlined @click="openNewEdit" />
        </template>
      </a-input>
      <a-list class="main-list" size="small" bordered :data-source="noteList" :split="false" style="border: none" :locale="{emptyText: '暂无数据'}">
      <template #renderItem="{ item }">
        <div class="main-list-item" @click="openEdit(item)">
          <a-list-item  class="list-item">
            <div style="display: flex; flex-direction: row">
              <div class="itemList-title">{{ item.title }}</div>
              <div class="itemList-content" >{{ item.content }}</div>
            </div>
            <span class="list-item-time">{{ item.createtime.slice(-8) }}</span>
          </a-list-item>
        </div>
      </template>
    </a-list>
    </div>
    <div class="edit-div">
      <div v-if="editNote.title">
        <div class="edit-title">
          <a-input @blur="saveNote" style="font: italic small-caps bold 16px/1.5 " v-model:value="editNote.title" :bordered="false" placeholder="标题" />
        </div>
        <a-divider  style="margin: 0"></a-divider>
        <a-textarea  @blur="saveNote" class="edit-content" v-model:value="editNote.content" placeholder="编辑内容" :rows="24" />
      </div>
      <div v-else class="deit-default">
        <span><EditOutlined /></span>
        <span>编辑区</span> 
      </div>
    </div>
  </div>

</template>
  
  <script setup>
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount, h } from "vue";
import { debounce } from 'lodash-es'
import { useRouter } from 'vue-router';
import { ProfileOutlined, AppstoreOutlined, AppstoreAddOutlined, BlockOutlined, PlusCircleOutlined,EditOutlined } from '@ant-design/icons-vue'



// data
const router = useRouter();
let noteList = reactive([])
const menuOpenKeys = ref(['1']);
const menuSelectedKeys = ref(['sub1']);
const groupOpenKeys = ref(['1']);
const groupSelectedKeys = ref(['sub1']);
let listType = reactive({
  type: 'allNote',
  groupName: ''
})
const groupList = reactive([
  {name: '测试群组'},
  {name: '测试群组2'},
  {name: '测试群组3'},
])
let editNote = reactive({
  content: '',
  title: '',
  uuid: '',
  group: '',
  createtime: '',
})

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
  getItem('所有片段', 'allNote', () => h(AppstoreOutlined), null, null, 'allNote'),
  getItem('未分类', 'unGroup', () => h(BlockOutlined), null, null, 'unGroup')
]);
const groupItems = reactive([
  getItem('测试群组1', 'uuid', () => h(ProfileOutlined), null, null, 'group')
])
// methods
const menuClick = async (menu) => {
  listType.type = menu.key
  refreshList()
}

const refreshList = async () => {
  noteList.length = 0
  let list = []
  console.log('listType: ', listType);
  
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
  editNote.title = '编辑标题'
  editNote.group = ''
  editNote.createtime = ''
  editNote.uuid = ''
}
// 添加笔记
const addNote = () => {
  console.log('添加笔记');
}
const openEdit = (note) => {
  editNote.content = note.content
  editNote.title = note.title
  editNote.group = note.group
  editNote.createtime = note.createtime
  editNote.uuid = note.uuid
}
const saveNote = async () => {
  if (!editNote.content || !editNote.title) return
  const note = {...editNote}
  console.log('note: ', note.content);
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

onMounted(() => {
  refreshList()
});

onBeforeUnmount(() => {
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {
  // esc 返回home页面
  window.addEventListener('keydown', handleKeydown);
  window.electron.resizeWindow({width: 1000, height: 650})
  // if (mainContent.value) {
  //   const resizeObserver = new ResizeObserver(entries => {
  //     entries.forEach(entry => {
  //       // const size = {width: 500.1231232132, height: 300}
  //       const size = {width: Math.ceil(entry.contentRect.width) + 20, height: Math.ceil(entry.contentRect.height) + 30}
  //       console.log('新的宽度:', size.width, '新的高度:', size.height)
  //       window.electron.resizeWindow(size)
  //     })
  //   })

  //   // 开始观察 DOM 元素
  //   resizeObserver.observe(mainContent.value)

  //   // 清理函数，组件卸载时停止观察
  //   onUnmounted(() => {
  //     resizeObserver.disconnect()
  //   })
  // }
})

// 在组件卸载前移除事件监听器
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});



</script>
  
<style scoped  lang="less">
.move-div {
  height: 10px;
  background-color: aliceblue;
  -webkit-app-region: drag;
}
.main-content {
  display: flex;
  flex-direction: row;
  margin: 0 auto;
  width: 1000px;
  height: 600px;
  .group-content {
    display: flex;
    flex-direction: column;
    width: 15%;
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
    .group-list {
      margin: 0.3em 0;
      border-radius: 10px;

    }
    .add-button {
      margin-top: auto;
    }
  }

  .item-content {
    width: 25%;
    margin: 5px 2px;
    background-color: #f0f5ff;
    .main-list {
      margin: 4px;
      .main-list-item{
        :hover {
          border-radius: 6px;
          background-color: #c2d5ff;
        }
      }
    }
  }
  // -webkit-app-region: drag;
}
.list-item {
  padding: 4px 8px;
  background-color: #dfe4f9;
  border-radius: 6px;
  margin: 4px;
  display: flex;
  flex-direction: row;
  justify-content:space-between;
  span {
    font-size: 0.8em;
  }
  .itemList-title {
    margin-right: 3px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 7em;
    font-size: 0.8em;
  }
  .itemList-content {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 8em;
    font-size: 0.8em;
  }
  .list-item-time {
    font-size: 0.6em;
  }
}
.edit-div {
  width: 55%;
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



</style>
  