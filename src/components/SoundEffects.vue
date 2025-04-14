<template  style="height: 260px">
  <ToolBar/>
  <div class="dir-setting">
    <span>文件目录:  </span>
    <a-input size="small" style="width: 200px" v-model:value="rootDir"></a-input>
    <a-button size="small" @click="getMusicDirList">获取</a-button>
    <a-button v-if="!toUse" size="small" @click="toUse=!toUse"><UnlockOutlined/></a-button>
    <a-button v-if="toUse" size="small" @click="toUse=!toUse"><LockOutlined/></a-button>
  </div>
  <div class="main-content">
    <div style="width: 25%;height: 100%">
      <a-list class="file-list" size="small" bordered :data-source="fileTree" :split="false" style="border: none" :locale="{emptyText: '列表'}">
        <template #renderItem="{ item }" >
          <div class="dir-list-item" :class="{'selected':activeDir.id === item.id}" @click="selecteddir(item)" @dragover.prevent @drop="dropMusic($event, item)" >
            <a-list-item  class="dirList-item" >
              <div style="margin: 0 5px"></div>
              <div style="display: flex; flex-direction: row;justify-content: center">
                <div class="itemList-title"><span>{{ item.name }}</span></div>
              </div>
            </a-list-item>
            <span v-if="childIsDir(item)">
              <DownOutlined v-show="!item.activeChild" style="font-size: 0.5em;" @click.stop="activeChild(item)"/>
              <UpOutlined v-show="item.activeChild" style="font-size: 0.5em;" @click.stop="activeChild(item)"/>
            </span>
          </div>
          <div v-for="(cdir, cindex) in item.children" :key="cindex">
            <div class="dir-list-item" :class="{'selected':activeDir.id === cdir.id}" @click="selecteddir(cdir)"  v-if="childIsDir(item) && item.activeChild"  >
              <div style="display: flex; flex-direction: row;justify-content: center">
                <div class="itemList-title"><span>{{ cdir.name }}</span></div>
              </div>
            </div>
          </div>
        </template>
      </a-list>
    </div>
    <div class="file-content">
      <div style="margin: 9px">
        <a-row class="gutter-row" v-show="fileTree.length" :gutter="[8, 2]">
          <a-col class="gutter-col"  v-for="(music,index) in activeDir?.children" :key="index" :span="5">
            <div class="gutter-box" :title="music.name" @mouseenter="selectMusic(music, index)" @mouseleave="pauseMusic(music, index)"  draggable="true" @dragstart="onDragStartFile($event,music)">
              <div class="audio-canvas" ref="waveformRef" ></div>
              <audio ref="audioDom" @timeupdate="audioTimeupdate(music, index)" :volume='0.4'>
                <source :type="music.fileType">
              </audio>
            </div>
            <div style="display: flex; justify-content: space-evenly">
              <a-progress style="margin: auto 1px;" :percent="music.percent" size="small" :show-info="false" :stroke-color="['#9098ff', '#52c41a', '#f5222d']" />
              <span style="font-size: 0.8em; margin: auto 0;">{{ music.duration + 's' }}</span> 
              <CloseCircleOutlined @click="delMusic(music)" class="hoverActive" style="font-size: 10px;margin: auto 3px"/>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount } from "vue";
// import { settingFilled, StarFilled, StarTwoTone } from 'ant-design/icons-vue';
import { LinkOutlined,AppstoreOutlined,UpOutlined,DownOutlined,DeleteOutlined,
  DownloadOutlined,UploadOutlined,RollbackOutlined,LeftOutlined,RightOutlined,
  CloseCircleOutlined,UnlockOutlined,LockOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router';
import { message } from "ant-design-vue";
import WaveSurfer from 'wavesurfer.js';
import ToolBar from "./module/ToolBar.vue";
import  "../style/main.less";

// 接口定义
interface dirItemI {
  id:string,
  name:string,
  path:string,
  type:string,
  children:musicItemI[],
  activeChild?:boolean
}
interface musicItemI {
  id:string,
  name:string,
  path:string,
  type:string,
  canvas?:boolean,
  fileType?:string,
  percent?:number,
  duration?:number
}

// 数据
const toUse = ref(true)
const router = useRouter();
let dragFilePath = ''
let rootDir = ref<string>('E:\\music\\音效')
let fileTree = ref<dirItemI[]>([])
let activeDir = ref<dirItemI>({
  id:'',
  name:'',
  path:'',
  type:'',
  children:[{id:'',name:'',path:'',type:''}]
})
const waveformRef = ref(null);
let waveSurfer = null
let hoverMusic = ref<musicItemI>({
  id:'',
  name:'',
  path:'',
  type:'',
  canvas:false,
})
let audioDom = ref<HTMLAudioElement[] | null>([])
const backHome = ():void => {
  router.push('/')
}
const gotoNext = ():void => {
  router.push('/tomatoClock')
}
const gotoPre = ():void => {
  router.push('/videoTool')
}
const onDragOver = ($event):void => {
  $event.preventDefault() // 必须阻止默认行为，否则drop事件不会触发
}
const dropMusic = async (event, item:dirItemI):Promise<void> => {
  if (item.name !== '收藏') return
  if (toUse.value) {
    event.preventDefault()
    return
  }
  const dirPath = item.path
  await window.electron.copyFile({dirPath, filePath:dragFilePath})
  getMusicDirList()
  dragFilePath = null
}

const activeChild = (dir) => {
  dir.activeChild = !dir.activeChild
}

const delMusic = (music:musicItemI):void => {
  window.electron.delFile({filePath:music.path})
  getMusicDirList()
}

const audioTimeupdate = (music:musicItemI, index:number) => {
  const percent = Math.floor(audioDom.value[index].currentTime / audioDom.value[index].duration * 100)
  music.percent = percent
}
const selectMusic = async (music:musicItemI, index:number) => {
  hoverMusic.value = music
  const data = await window.electron.readFile(music.path)
  const blob = new Blob([data], {type:'audio/wav'})
  const url = URL.createObjectURL(blob)
  if (!audioDom.value[index]) return
  audioDom.value[index].src = url
  audioDom.value[index].play().then().catch((error) => (error))
}

const pauseMusic = (music:musicItemI, index:number):void => {
  setTimeout(() => {
    music.percent = 0
  }, 100);
  if (!audioDom.value[index]) return
  audioDom.value[index].pause()
}


const getMusicDirList = async () => {
  const files = await window.electron.getMusicDirList(rootDir.value)
  // files.children.sort((a,b) => b.name-a.name)
  files.children.sort((a,b) => b.name.includes('收藏')-a.name.includes('收藏'))
  fileTree.value = files.children
  if (files.children.length > 0) {
    selecteddir(files.children[0])
  }
}

const selecteddir = async (dir:dirItemI) => {
  if (childIsDir(dir)) {
    dir.activeChild = !dir.activeChild
    return
  }
  activeDir.value = dir
  // 清理画布
  for (let index = 0; index < dir.children.length; index++) {
    waveformRef.value[index] && (waveformRef.value[index].innerHTML = '')
    const music = dir.children[index];
    setTimeout(() => {
      drawWave(music.path, index, music.fileType)
    }, 100);
  }
}

// 波形 单独提出来异步节省时间
const drawWave = async (path:string, index:number, fileType) => {
  const data = await window.electron.readFile(path)
  const blob = new Blob([data], {type:fileType})
  const url = URL.createObjectURL(blob)
  waveSurfer = WaveSurfer.create({
      container: waveformRef.value[index],
      waveColor: '#7a96ff',
      progressColor: '#000',
      cursorColor: '#000',
      height: 20,
      normalize: true,
      fillParent: true,
      barWidth: 1,
    })
  waveSurfer.load(url)
}

const onDragStartFile = (event, file:musicItemI) => {
  if (toUse.value) {
    event.preventDefault()
  }
  if(!file.path) {
    message.error('请稍等...')
    return
  }
  dragFilePath = file.path
  window.electron.startDrag(dragFilePath)
}

const childIsDir = (dir) => {
  if (dir.children && dir.children.length > 0 && dir.children[0].type === 'directory') {
    return true
  }
  return false
}

onBeforeUnmount(() => {
  // waveSurfer.destroy()
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {
  window.electron.resizeWindow([400, 270])
  getMusicDirList()
})

</script>

<style scoped  lang="less">
.dir-setting {
  margin: 4px 0;
  display: flex;
  justify-content: space-evenly;
}
.moveBar {
  margin-bottom: 2px;
  height: 10px;
  background-color: aliceblue;
  -webkit-app-region: drag;
}
.main-content {
  display: flex;
  flex-direction: row;
  margin: 10px 8px;
  height: 205px;
  .file-list {
    padding: 0 4px;
    width: 100%;
    border-radius: 6px;
    height: 100%;
    overflow: auto;
    border: 1px solid;
    background-color: rgb(255, 249, 242);
    &::-webkit-scrollbar {
      width: 0px;  /* 隐藏垂直滚动条 */
      height: 0px;  /* 隐藏水平滚动条 */
    }
    .dir-list-item {
      margin: 3px 0;
      display: flex;
      justify-content: center;
      overflow: auto;
      border-radius: 4px;
      background-color: rgb(255, 244, 233);
      &:hover {
        background-color: #faebd7;
      }
      .dirList-item {
        padding: 2px;
      }
      .itemList-title {
        cursor: default;
      }
    }
  }
  .file-content {
    overflow: auto;
    margin: 0 10px 5px 10px;
    width: 85%;
    height: 200px;
    background-color: #fcf7f1;
    &::-webkit-scrollbar {
      width: 0px;  /* 隐藏垂直滚动条 */
      height: 0px;  /* 隐藏水平滚动条 */
    }
  }
}
.gutter-row {
  margin-right: -31px !important;
  .gutter-col {    
    background-color: #cbdaff;
    border-radius: 4px;
    margin: 3px;
  }
}
.gutter-box {
  height: 30%;
  padding: 8px 0;
  border-radius: 2px;
  .music-title {
    // max-height: 3em;
    padding: 0 1em;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 6em;
    font-size: 1em;
  }
  .audio-canvas {
    height: 20px;
    width: 100%;
    background-color: #ffffff;
    margin: 0px 0;
  }
}
.selected {
  background-color: #e6f4ff !important;
  &:hover {
    background-color: #faebd7;
  }
}
</style>
