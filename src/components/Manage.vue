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
      <a-input @click="inputText" size="small">
        <template #suffix>
          <PlusCircleOutlined @click="addNote" />
        </template>
      </a-input>
      <a-list class="main-list" size="small" bordered :data-source="noteList" :split="false" style="border: none" :locale="{emptyText: '暂无数据'}">
      <template #renderItem="{ item }">
        <div class="list-item">
          <a-list-item>{{ item.title }}</a-list-item>
        </div>
      </template>
    </a-list>
    </div>
    <div>编辑栏</div>
  </div>

</template>
  
  <script setup>
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount, h } from "vue";
import { debounce } from 'lodash-es'
import { useRouter } from 'vue-router';
import { ProfileOutlined, AppstoreOutlined, AppstoreAddOutlined, BlockOutlined, PlusCircleOutlined} from '@ant-design/icons-vue'



// data
const router = useRouter();
let noteList = reactive([{title:'测试', content: '测试内容'}])
const selectedKeys = ref(['1']);
const openKeys = ref(['sub1']);
const groupList = reactive([
  {name: '测试群组'},
  {name: '测试群组2'},
  {name: '测试群组3'},
])

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
  getItem('所有片段', 'allNote', () => h(AppstoreOutlined)),
  getItem('未分类', 'unGroup', () => h(BlockOutlined))
]);
const groupItems = reactive([
  getItem('测试群组1', 'sub1', () => h(ProfileOutlined))
])
// methods
const menuClick = async (menu) => {
  noteList.length = 0
  let list = []
  if (menu.key === 'allNote') {
    list = await window.electron.getAllNote()
    debugger
  } else if (menu.key === 'unGroup') {
    list = await window.electron.getUngroupNote()
  }
  noteList.push(...list)
}

// 添加笔记
const addNote = () => {
  console.log('添加笔记');
  
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
  height: 30px;
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
    width: 20%;
    margin: 5px 2px;
  }
  // -webkit-app-region: drag;
}
.list-item {
  padding: 2px;
  :hover {
    border-radius: 6px;
  }
}


</style>
  