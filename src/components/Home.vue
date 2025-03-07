<template>
  <div class="main-content" ref="mainContent">
    <a-space class="input-search">
      <a-button @click="gotoManage" size="small"><SettingOutlined /></a-button>
      <a-input ref="mainInput" size="small" v-model:value="searchInput" @input="onSearch" @keydown.enter="copySel" >
      </a-input>
      <a-button @click="changeTool" size="small"><RightOutlined /></a-button>
    </a-space>
    <div><span class="desc-text">输入查询 点击复制 | dylink</span></div>
    <a-list  v-show="dataList.list.length" class="main-list" size="small" bordered :data-source="dataList.list" :split="false" style="border: none" :locale="{emptyText: '暂无数据'}">
      <template #renderItem="{ item, index }">
        <div ref="mainListDom" :class="{'list-item':true,'item-selected':selIndex===index}" @click="copyContent(item)" @mouseenter="changeSel(index)">
          <a-list-item>
            <div :tabindex="index" @focus="selIndex=index" style="font:  bold 1em/1.5 'Arial', sans-serif;">{{ item.title }}</div>
            <div class="note-content">{{ item.content }}</div>
          </a-list-item>
        </div>
      </template>
    </a-list>
  </div>

</template>
  
  <script setup>
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount } from "vue";
import { message } from "ant-design-vue";
import { SettingOutlined,RightOutlined } from '@ant-design/icons-vue'
import { debounce } from 'lodash-es'
import { useRouter } from 'vue-router';

// 数据
let searchInput = ref("");
let dataList = reactive({list: []})
const mainContent = ref(null)
const router = useRouter();
const selIndex = ref(0)
const mainListDom = ref(null)
const mainInput = ref(null)
// methods
const changeSel = (index) => {
  selIndex.value = index
}
const handleKeyDown = (event) => {
  
  if (event.key === 'ArrowUp') {
    if (selIndex.value > 0) selIndex.value--
    mainListDom.value.scrollTo({top:mainListDom.value.scrollHeight-30, behavior: 'smooth'})
  } else if (event.key === 'ArrowDown') {
    if (selIndex.value < dataList.list.length - 1) selIndex.value++
    mainListDom.value.scrollTo({top:mainListDom.value.scrollHeight+30, behavior: 'smooth'})
  }
  // mainListDom.value?.focus()
};
// 搜索框
const onSearch =  debounce(async () => {
  if (!searchInput.value) return
  const resList = await window.electron.mainSearch(searchInput.value.split(' '))
  dataList.list = resList
  selIndex.value = 0
}, 300);

const gotoManage = () => {
  router.push('/manage')
}

const changeTool = () => {
  router.push('/videoTool')
}

const copyContent = async (note) => {
  await navigator.clipboard.writeText(note.content)
}

const copySel = async () => {
  if (!dataList.list.length) return
  const text = dataList.list[selIndex.value].content
  await navigator.clipboard.writeText(text)
}


onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  mainInput.value.focus()
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {
  if (mainContent.value) {
    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(async entry => {
        const size = {width: Math.ceil(entry.contentRect.width) + 20, height: Math.ceil(entry.contentRect.height) + 30}
        console.log('新的宽度:', size.width, '新的高度:', size.height)
        window.electron.resizeWindow(size)
      })
    })

    // 开始观察 DOM 元素
    resizeObserver.observe(mainContent.value)

    // 清理函数，组件卸载时停止观察
    onUnmounted(() => {
      resizeObserver.disconnect()
    })
  }

})

</script>
  
  <style scoped  lang="less">
h1 {
  color: #42b983;
}
.tag-select {
  margin: 1em auto;
}
.main-content {
  width: 341px;
  margin: 0 auto;
  -webkit-app-region: drag;
  .input-search {
    background-color: #B1B2FF;
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 0.5em auto;
    padding: 0.5em;
    border-radius: 10px;
    button {
      -webkit-app-region: no-drag;
      margin: 0;
    }
    input {
      -webkit-app-region: no-drag;
      width: 250px;
    }
  }
  .main-list {
    -webkit-app-region: no-drag;
    overflow: auto;
    max-height: 500px;
    &::-webkit-scrollbar {
      width: 0px;  /* 隐藏垂直滚动条 */
      height: 0px;  /* 隐藏水平滚动条 */
    }
  }
}
.desc-text {
  font-size: 0.8em;
  color: #aaaaaa;
}
.list-item {
  width: auto;
  height: auto;
}
.item-selected {
  background-color: #D2DAFF;
  border-radius: 10px;
}

.note-content {
  text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 8em;
    font-size: 0.9em;
}
</style>
  