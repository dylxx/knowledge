<template style="height: 200px">
  <div class="moveBar" ></div>
  <div style="display: flex; justify-content: space-evenly">
    <LeftOutlined class="hoverActive" @click="gotoPre" />
    <RollbackOutlined class="hoverActive" @click="backHome"/>
    <RightOutlined class="hoverActive" @click="gotoNext"/>
  </div>
  <div class="main-content">
    <div class="main-left ">
      <a-list class="typeList-main scoll" size="small" bordered :data-source="typeList" :split="false" style="border: none" :locale="{emptyText: ' '}">
          <template #renderItem="{ item, index }">
            <div class="type-list-item" >
              <a-list-item  class="typeList-item itemHover "  @click="addTimeSlice(item)">
                <div style="display: flex; flex-direction: row">
                  <div class="itemList-title">{{ item.name }}</div>
                </div>
              </a-list-item>
              <div style="display: flex;flex-direction: column; width: auto">
                <div style="display: flex;flex-direction: row">
                  <a-button size="small" style="margin: 2px 1px" @click="timeDown(item)"><LeftOutlined/></a-button>
                  <a-button size="small" style="width: auto;min-width:31px;margin:2px 0;" >{{ item.minute }}</a-button>
                  <a-button size="small" style="margin: 2px 1px 1px 2px" @click="timeUp(item)"><RightOutlined/></a-button>
                  <a-button size="small" style="margin: 2px 3px 1px 1px" @click="delTomato(item, index)"><CloseOutlined /></a-button>
                </div>
              </div>
            </div>
          </template>
        </a-list>
        <div class="addType-space" style="display: flex">
            <a-input class="add-name" placeholder="名称" size="small" v-model:value="addTypes.name" ></a-input>
            <a-input size="small" style="width: 40px;height: 24px;" v-model:value="addTypes.minute"></a-input>
            <a-button size="small" @click="toAddTypes"><PlusOutlined /></a-button>
        </div>
    </div>
    <div class="main-right">
      <a-list class="main-list scoll" size="small" bordered :data-source="currList" :split="false" :locale="{emptyText: '任务区'}">
          <template #renderItem="{ item, index }">
            <div class="type-list-item" >
              <a-list-item  class="typeList-item itemHover">
                <div style="display: flex; flex-direction: row">
                  <div class="itemList-title">{{ item.name }}</div>
                </div>
              </a-list-item>
              <div style="display: flex;flex-direction: column; width: auto">
                <div style="display: flex;flex-direction: row">
                  <a-button size="small" style="width: auto;margin:2px 0;min-width: 50px" >{{ item.curr }}</a-button>
                  <a-button size="small" style="margin: 2px 3px 1px 2px"><CloseOutlined @click="closeSlice(index)"/></a-button>
                </div>
              </div>
            </div>
          </template>
        </a-list>
        <div class="tool-bar">
          <PauseOutlined class="hoverActive" v-if="pause" @click="pauseTime"/>
          <PlayCircleOutlined class="hoverActive"   v-if="!pause" @click="startTime"/>
          <CloseOutlined class="hoverActive"  @click="clearAll"/>
          <AlertOutlined :class="{hoverActive:true,clockActive:clockActive}"  @click="stopVoice" />
          <audio ref="audioDom" :src="audioSrc" loop>
          </audio>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount } from "vue";
// import { settingFilled, StarFilled, StarTwoTone } from 'ant-design/icons-vue';
import { CloseOutlined,PlusOutlined,AlertOutlined,PlayCircleOutlined,RollbackOutlined,LeftOutlined,RightOutlined,PauseOutlined } from '@ant-design/icons-vue'
import { debounce } from 'lodash-es'
import { useRouter } from 'vue-router';
import { message } from "ant-design-vue";
import { getCurrentTime, toParams } from "../js/tool";
import "../style/main.less";

// 数据
const router = useRouter();
let searchInput = ref('')
let result = ref('123123')
let timer = ref(0)
let addTime = ref(0)
const audioSrc = new URL('../assets/tomatoClock.mp3', import.meta.url).href;
let typeList = ref([
])
let currList = ref([
])
let addTypes = ref({
  name: '',
  uuid: '',
  minute: 0,
  createtime: ''
})
let audioDom = ref(null)
let pause = ref(false)
let clockActive = ref(false)

//methods
const getTomatoList = async () => {
  const list = await window.electron.search({name:'getTomatoList'})
  typeList.value = list
}
const toAddTypes = async () => {
  if (!addTypes.value.name) return
  const uuid = crypto.randomUUID()
  const {name, minute} = addTypes.value
  // 添加类型
  const newTypes = {uuid, name,minute,createtime:getCurrentTime()}
  typeList.value.push({...newTypes, second:minute*60})
  await window.electron.runSql({name:'addTomato', params:newTypes})
  addTypes.value.name = ''
  addTypes.value.minute = 0
  addTypes.value.createtime = ''
}
const pauseTime = () => {
  pause.value = false
  clearInterval(timer.value)
}

const startTime = () => {
  if(currList.value.length === 0) return
  pause.value = true
  timer.value = setInterval(() => {
    const second = --currList.value[0].second
    currList.value[0].curr = formatTime(second)
    if (second === 0) {
      currList.value.splice(0,1)
      pauseTime()
      audioDom.value.play()
      clockActive.value = true
    }
  }, 1000);
}
const stopVoice = () => {
  const audio = audioDom.value
  audio.pause()
  audio.currentTime = 0
  clockActive.value = false
}
const clearAll = () => {
  currList.value = []
  clearInterval(timer.value)
  pause.value = false
}
const timeDown = (typeItem) => {
  typeItem.minute--
}
const delTomato = (tomato, index) => {
  window.electron.runSql({name:'delTomato', params: {uuid: tomato.uuid}})
  typeList.value.splice(index, 1)
}
const timeUp = (typeItem) => {
  typeItem.minute++
}
const closeSlice = (index) => {
  currList.value.splice(index, 1)
}
const addTimeSlice = (typeItem) => {
  const curr = formatTime(typeItem.minute*60)
  const newTimeSlice = {...typeItem, curr, second: typeItem.minute*60}
  currList.value.push(newTimeSlice)
}
const execCode = async () => {
  result.value = await window.electron.execCode(searchInput.value)
}

const gotoMusic = () => {
  router.push('/soundEffects')
}
const gotoPre = () => {
  router.push('soundEffects')
}

const backHome = () => {
  router.push('/')
}
const gotoNext = () => {
  router.push('/tomatoClock')
}

function formatTime(seconds) {
  // 确保输入是数字且不为负
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  
  // 计算分钟和秒
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  // 补零格式化，确保两位数显示
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
  return `${formattedMinutes}:${formattedSeconds}`;
}

onBeforeUnmount(() => {
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {
  window.electron.resizeWindow({width: 406, height: 250})
  getTomatoList()
})

</script>

<style scoped  lang="less">
.main-content {
  display: flex;
  flex-direction: row;
  margin: 3px;
  width: 97%;
  height: 200px;
  padding: 3px;
  border-radius: 3px;
  background-color:rgb(179, 220, 255);
  .main-left {
    width: 55%;
    border-radius: 3px;
    margin-right: 10px;
    min-width: 205px;
    background-color: rgb(129, 196, 255);
    .typeList-main {
      height: 86%;
      max-height: 154px;
    }
  }
  .main-right {
    background-color: antiquewhite;
    min-width: 160px;
    margin-right: 6px;
    width: 40%;
    .main-list {
      border: none;
      height: 86%;
      max-height: 178px;
    }
  }
}

.type-list-item {
  width: auto;
  height: 28px;
  display: flex;
  margin: 4px;
  background-color: rgb(255, 255, 255);
}
.typeList-item {
  width: 100%;
  background-color: #fff4e6;
  border-radius: 3px;
  margin: 4px;
  &:hover {
    // background-color: #ffe1ba;
  }
}
.itemList-title {
  white-space: nowrap;       /* 禁止换行 */
  overflow: hidden;           /* 超出部分隐藏 */
  text-overflow: ellipsis;    /* 显示省略号 */
  max-width: 200px;           /* 设置最大宽度，可以根据需要调整 */
  cursor: default;
}
.tool-bar {
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 3px;
  margin:2px;
  background-color: #ffdfb6;
  padding: 4px;
}
.clockActive {
  color: red;
}
.addType-space {
  margin: 14px 4px 2px 4px;
  display: flex;
  justify-content: space-evenly;
  background-color: white;
  padding: 3px;
  border-radius: 3px;
  height: 24px;
  .add-name {
    width: 85px;
    height: 24px;
    background-color: rgb(255, 246, 235);
    border: none;
    &:focus {
      box-shadow:none;
      border: none;
    }
  }
}
</style>
