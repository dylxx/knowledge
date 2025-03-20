<template>
  <div class="main-content" ref="mainContent">
    <div class="moveBar"></div>
    <div class="input-search">
      <a-button @click="gotoManage" size="small"><SettingOutlined /></a-button>
      <a-input class="main-input" ref="mainInput" size="small" v-model:value="searchInput" @input="onSearch" @keydown.enter="copySel">
      </a-input>
      <a-button @click="changeTool" size="small"><RightOutlined /></a-button>
    </div>
    <div style="display: flex;justify-content: space-evenly;" v-if="!dataList.list.length">
      <SettingOutlined  class="hoverActive" @click="goto('manage')"/>
      <VideoCameraOutlined class="hoverActive" @click="goto('videoTool')" />
      <SoundOutlined  class="hoverActive" @click="goto('soundEffects')"/>
      <ScheduleOutlined  class="hoverActive" @click="goto('tomatoClock')"/>
    </div>
    <a-list  v-show="dataList.list.length" class="main-list" size="small" bordered :data-source="dataList.list" :split="false" style="border: none" :locale="{emptyText: '暂无数据'}">
      <template #renderItem="{ item, index }">
        <div ref="mainListDom" :class="{'list-item':true,'item-selected':selIndex===index}" @click="copyContent(item)" @mouseenter="changeSel(index)">
          <a-list-item>
            <div :tabindex="index" @focus="selIndex=index" style="font:  bold 1em/1.5 'Arial', sans-serif;">{{ item.title || item.name }}</div>
            <div class="note-content">{{ item.content || item.username }}</div>
          </a-list-item>
        </div>
      </template>
    </a-list>
  </div>

</template>
  
  <script setup>
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount } from "vue";
import { message } from "ant-design-vue";
import { SettingOutlined,RightOutlined,VideoCameraOutlined,SoundOutlined,ScheduleOutlined } from '@ant-design/icons-vue'
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
const mainheight = ref(0)
let toResize = ref(false)
// methods
const changeSel = (index) => {
  selIndex.value = index
}
const goto = (uri) => {
  router.push(uri)
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
  toResize.value = true
  if (!searchInput.value) {
    dataList.list = []
    return
  }
  let resList = []
  if (searchInput.value === ' ') return
  if (searchInput.value.startsWith(' ')) {
    resList = await window.electron.mainSearchPwd(searchInput.value.split(' '))
  } else {
    resList = await window.electron.mainSearch(searchInput.value.split(' '))
  }
  dataList.list = resList
  selIndex.value = 0
}, 300);

const resizeWin = () => {
  window.electron.resizeWindow([null, mainContent.value.offsetHeight + 20])
}

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
  const item = dataList.list[selIndex.value]
  const text = item.content || item.password
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
        // const size = {width: Math.ceil(entry.contentRect.width) + 20, height: Math.ceil(entry.contentRect.height) + 20}
        // console.log('新的宽度:', size.width, '新的高度:', size.height)
        // window.electron.resizeWindow(size)
        if (toResize.value) {
          window.electron.resizeWindow([null, entry.contentRect.height+ 20])
          toResize.value = false
        }
      })
    })

    // 开始观察 DOM 元素
    resizeObserver.observe(mainContent.value)

    // 清理函数，组件卸载时停止观察
    onUnmounted(() => {
      resizeObserver.disconnect()
    })
  }
  window.electron.resizeWindow([300, 100])
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
  height: 100%;
  min-width: 200px;
  width: 100%;
  margin: 0 auto;
  .input-search {
    background-color: #B1B2FF;
    display: flex;
    flex-direction: row;
    justify-content:space-between;
    margin: 0.5em auto;
    padding: 0.5em;
    border-radius: 10px;
    button {
      margin: 0;
    }
  }
  .main-list {
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
  transition: all 0.2s ease;
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

.main-input {
  width: 100%;
  margin: auto 3px;
}

</style>
  