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
                  <div style="display: flex; flex-direction: row;margin: 0 auto;">
                    <div :title="item.name" class="itemList-title">{{ item.name }}</div>
                  </div>
                </a-list-item>
              <div style="display: flex;flex-direction: column; width: auto">
                <div style="display: flex;flex-direction: row">
                  <a-button size="small" style="margin: 2px 1px" @click="timeDown(item)" @mousedown="startPress(item, 0)" @mouseup="stopPress" @mouseleave="stopPress"><LeftOutlined/></a-button>
                  <a-button size="small" style="width: auto;min-width:31px;margin:2px 0;" >{{ item.minute }}</a-button>
                  <a-button size="small" style="margin: 2px 1px 1px 2px" @click="timeUp(item)" @mousedown="startPress(item, 1)" @mouseup="stopPress" @mouseleave="stopPress"><RightOutlined/></a-button>
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
    <div class="main-right" @dragover.prevent @drop="dropFileTrans($event)">
      <a-list class="main-list scoll" size="small" bordered :data-source="currList" :split="false" :locale="{emptyText: '拖拽音乐文件至此可替换闹钟'}">
          <template #renderItem="{ item, index }">
            <div :class="['type-list-item',{'anime-in':item.isnew},{'anime-out':item.isout}]" >
              <a-list-item  class="typeList-item itemHover">
                <div style="display: flex; flex-direction: row">
                  <div class="itemList-title">{{ item.name }}</div>
                </div>
              </a-list-item>
              <div style="display: flex;flex-direction: column; width: auto">
                <div style="display: flex;flex-direction: row">
                  <a-button size="small" style="width: auto;margin:2px 0;min-width: 50px" >{{ item.curr }}</a-button>
                  <a-button size="small" style="margin: 2px 3px 1px 2px"><CloseOutlined @click="closeSlice(item,index)"/></a-button>
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
import { getCurrentTime, toParams  } from "../js/utils";
import "../style/main.less";

// 数据
const router = useRouter();
let searchInput = ref('')
let result = ref('123123')
let timer = null
let addTime = ref(0)
let audioDom = ref(null)
let audioSrc = ref(new URL('../assets/tomatoClock.mp3', import.meta.url).href)
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
let pause = ref(false)
let clockActive = ref(false)
let intervalUpDown = null
let musicSrc = ''
//methods
// 拖放音乐文件
const dropFileTrans = async (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (!file.type.includes('audio')) return
  const reader = new FileReader();
  reader.onload = async (e) => {
    const fileContent = e.target.result;
    // 将文件内容传递到主进程进行处理
    const newFile = await window.electron.uploadFile({
      fixName: 'tomatoClock',
      name: file.name,
      type: file.type,
      size: file.size,
      content: fileContent
    }, 'userData');
    const data = await window.electron.readMusic(newFile.path)
    const blob = new Blob([data], {type:file.type})
    audioSrc.value = URL.createObjectURL(blob)
    window.electron.updateConfig({name: 'tomatoMusic', value: newFile.path})
  };
  reader.readAsArrayBuffer(file);
}
// 长按增加/较少时间效果
const startPress = (tomato, type) => {
  if (intervalUpDown) return; // 防止重复触发
  intervalUpDown = setInterval(() => {
    if(type) {
      tomato.minute++;
    } else {
      tomato.minute--;
    }
  }, 200); // 每100ms触发一次
};

const stopPress = () => {
  clearInterval(intervalUpDown);
  intervalUpDown = null;
};
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
  clearInterval(timer)
}

const startTime = () => {
  if(currList.value.length === 0) return
  pause.value = true
  timer = setInterval(() => {
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
  if (!audio.paused) {
    audio.pause()
    audio.currentTime = 0
    clockActive.value = false
  } else {
    audio.play()
    clockActive.value = true
  }
}
const clearAll = () => {
  currList.value = []
  clearInterval(timer)
  timer = null
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
const closeSlice = (item, index) => {
  item.isout=  true
  setTimeout(() => {
    currList.value.splice(index, 1)
  }, 300);
  // 移除列表元素
  // 关闭定时器和恢复暂停
  if (index === 0 && timer) {
    clearInterval(timer)
    timer = null
  }
  if (pause.value) pause.value = false
}
const addTimeSlice = (typeItem) => {
  const curr = formatTime(typeItem.minute*60)
  const newTimeSlice = {...typeItem, curr, second: typeItem.minute*60, isnew: true}
  currList.value.push(newTimeSlice)
  setTimeout(() => newTimeSlice.isnew = false, 300);
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
  router.push('/diary')
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

const initMusic = async () => {
  const mSrc = await window.electron.getConf('tomatoMusic')
  console.log(111,mSrc);
  
  if (!mSrc) return
  const extend = mSrc.substring(mSrc.lastIndexOf('.'))
  const data = await window.electron.readMusic(mSrc)
  if(!data) {
    window.electron.updateConfig({name:'tomatoMusic', value:''})
    return
  } 
  const blob = new Blob([data], {type:`audio/${extend}`})
  audioSrc.value = URL.createObjectURL(blob)
}

onBeforeUnmount(() => {
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {
  window.electron.resizeWindow([478,250])
  getTomatoList()
  initMusic()
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
    width: 53%;
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
    width: 45%;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 6em;
  &:hover {
    // background-color: #ffe1ba;
  }
}
.itemList-title {
  white-space: nowrap;       /* 禁止换行 */
  overflow: hidden;           /* 超出部分隐藏 */
  text-overflow: ellipsis;    /* 显示省略号 */
  max-width: 5em;           /* 设置最大宽度，可以根据需要调整 */
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

// 动画
.anime-in {
  animation: anime-in 0.3s ease-out;
}
.anime-out {
  animation: anime-out 0.3s ease-in;
}

@keyframes anime-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes anime-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}
</style>
