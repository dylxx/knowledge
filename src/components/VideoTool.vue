<template  style="height: 200px">
  <div class="moveBar" ></div>
  <div style="display: flex; justify-content: space-evenly">
    <LeftOutlined class="hoverActive" @click="gotoPre" />
    <RollbackOutlined class="hoverActive" @click="backHome"/>
    <RightOutlined class="hoverActive" @click="gotoDiary"/>
  </div>
  <div class="main-content">
    <div class="transMp4-main">
      <div v-if="tool.curr === 0" style="display: flex;flex-direction: column"  @dragover.prevent @drop="dropFileTrans($event)">
        <div class="transMp4-drop">
          <UploadOutlined style="font-size: 28px" />
          <span style="font-size: 0.8em">拖拽上传</span>
          <span style="font-size: 0.8em">转{{ transFormat }}</span>
        </div>

      </div>
      <div v-if="tool.curr === 1" class="transMp4-drop" @dragover.prevent @drop="dropFileMerge($event)">
        <UploadOutlined style="font-size: 28px" />
        <span style="font-size: 0.8em">合并mp4</span>
        <span style="font-size: 0.8em">音视频同时拖拽</span>
      </div>
      <ul class="transMp4-file" >
        <li v-for="(file,index) in fileData.list" :key="index">
          <div style="display: flex">
            <LinkOutlined style="margin:auto 3px"></LinkOutlined>
            <div class="transMp4-FileName" :title="file.name" draggable="true" @dragstart="onDragStartFile($event,file)">{{ file.name }}</div>
            <a-progress :status="file.active" :percent="file.percent" size="small" style="margin: auto;min-width: 20%" />
            <!-- <DeleteOutlined class="delIcon" @click="deleteFile(file)"  /> -->
            <!-- <DownloadOutlined v-if="file.convert" @click="downlaodFile(file)" class="downloadIcon"/> -->
          </div>
        </li>
      </ul>
      <div class="tool-bar">
        <a-tooltip class="tool-item">
          <a-popover trigger="hover" v-model:open="formatVisible" placement="leftTop">
            <template #content >
              <div style="height: 90px;margin: -6px">
                <a-tree
                  class="scoll formatTree"
                  v-model:selectedKeys="selectedKeys"
                  v-model:expandedKeys="expandedKeys"
                  :tree-data="treeData"
                  size="small"
                  @select="selTree"
                >
                <template #switcherIcon="{ switcherCls, key }">
                  <CaretDownOutlined :class="switcherCls" @mouseenter="expandedKeys=[key]"/>
                </template>
                </a-tree>
              </div>
            </template>
            <MenuFoldOutlined class="hoverActive"/>
          </a-popover>
        </a-tooltip>
        <DeleteOutlined class="hoverActive tool-item" title="清理列表和缓存" @click="clearAll"/>
        <DeliveredProcedureOutlined class="hoverActive tool-item" title="获取剪切板图片" @click="copyPhotoFromPlate" />
        <RetweetOutlined class="hoverActive tool-item" title="功能切换" @click="gotoPage('next')" />
      </div>
      <div class="tool-bar">
        <a-tooltip class="tool-item">
          <a-popover trigger="hover" v-model:open="deviceTooltip.formatVisible" placement="leftTop">
            <template #content >
              <div style="height: 70px">
                <ul class="deviceUl">
                  <li 
                    :class="{selActive:deviceTooltip.selected === item}" 
                    class="maxStr" v-for="(item, index) in deviceList" 
                    @click="deviceTooltip.selected = item;deviceTooltip.formatVisible=false" 
                    :key="index">{{ item }}
                  </li>
                </ul>
              </div>
            </template>
            <MenuFoldOutlined class="hoverActive" />
          </a-popover>
        </a-tooltip>
        <SoundOutlined :class="{doActive:recording.doing}" class="hoverActive tool-item" title="录音" @click="record"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount,watchEffect } from "vue";
// import { settingFilled, StarFilled, StarTwoTone } from 'ant-design/icons-vue';
import { LinkOutlined,CaretDownOutlined,DeliveredProcedureOutlined,CalculatorOutlined,
  RetweetOutlined,DeleteOutlined,UploadOutlined,RollbackOutlined,LeftOutlined,RightOutlined,
  MenuFoldOutlined,SoundOutlined } from '@ant-design/icons-vue'
import { debounce } from 'lodash-es'
import { useRouter } from 'vue-router';
import { message } from "ant-design-vue";
import "../style/main.less";
import utils,{ getCurrentTime } from "../js/utils";

// 数据
const router = useRouter();
const fileData = reactive({list:[]})
const expandedKeys = ref([]);
const selectedKeys = ref([]);
const deviceTooltip = reactive({
  selected: '',
  formatVisible: false
})
const deviceList = ref([])
let tool = reactive({
  curr: 0,
  max: 1
})
let recording = reactive({
  doing:false,
  id:0
})
let formatVisible = ref(false)
const treeData = [
  {title: '视频', key: '视频',children:[
      {title: 'mp4', key: 'mp4'},
      {title: 'mkv', key: 'mkv'},
      {title: 'webm', key: 'webm'},
    ]
  },
  {title: '音频', key: '音频',children:[
      {title: 'mp3', key: 'mp3'},
      {title: 'wav', key: 'wav'},
    ]
  },
  {title: '图片', key: '图片',children:[
      {title: 'png', key: 'png'},
      {title: 'jpg', key: 'jpg'},
      {title: 'webp', key: 'webp'},
    ]
  },
]
let transFormat = ref('mp4')
// methods
const selTree = (keys, e) => {
  if (e.node && !e.node.children) {
    transFormat.value = e.node.key
    formatVisible.value = false
  }
}
const record = async () => {
  if (recording.doing) {
    recordStop()
  } else {
    recordStart()
  }
  recording.doing = !recording.doing
  // const resp = window.electron.toRecord(params)
}
const recordStart = async () => {
  const device = deviceTooltip.selected ? deviceTooltip.selected : deviceList.value[0]
  console.log(222, device);
  
  const resp = await window.electron.toRecord({type: 'start', device})
  const {id,name,type,path} = resp
  recording.id = id
  fileData.list.push({id,name,type,path,percent:99,active:'active'})
  console.log('filedata::::', fileData.list);
}

const recordStop = async () => {
  const device = deviceTooltip.selected ? deviceTooltip.selected : deviceList.value[0]
  await window.electron.toRecord({type: 'stop', device})
  console.log(111);
  const file = fileData.list.find(item => item.id === recording.id)
  recording.id = 0
  file.percent = 100
  file.active = ''
}
const copyPhotoFromPlate = async () => {
  if (!navigator.clipboard || !navigator.clipboard.read) {
    alert("当前浏览器不支持读取剪切板内容！");
    return;
  }
  const clipboardItems = await navigator.clipboard.read();
  for (const item of clipboardItems) {
    for (const type of item.types) {
      if (type.startsWith("image/")) {
        
        const blob = await item.getType(type)
        const arrayBuffer = await blob.arrayBuffer(); // 获取图片数据
        const uuid = crypto.randomUUID()
        const timestamp = utils.getCurrentTime('YYYY-MM-DD_HH-mm-ss')
        const name = `${timestamp}.${type.replace('image/','')}`;
        fileData.list.push({id:uuid, name: name})
        const result = await window.electron.uploadFile ({
          id: uuid,
          name,
          type,
          fixName: timestamp,
          content: arrayBuffer
        }, 'temp')
        const file = fileData.list.find(item => item.id === result.id)
        file.path = result.path
        file.percent = 100
        return;
      }
    }
  }
  message.error('剪切板没有图片')
}
const backHome = () => {
  router.push('/')
}
const gotoPre = () => {
  router.push('/')
}
const gotoDiary = () => {
  router.push('/soundEffects')
}
const gotoPage = (page) =>{
  if(page === 'next' && tool.curr < tool.max) {
    tool.curr++
  } else if(page === 'next' && tool.curr >= tool.max) {
    tool.curr = 0
  } else if (page === 'pre' && tool.curr > 0) {
    tool.curr--
  }else if (page <= tool.max && page >= 0 ){
    tool.curr = page
  }
}
const deleteFile = (file) => {
  const f = fileData.list.find(item => item.uuid = file.uuid)
  f.percent++
}

const onDragStartFile = (event, file) => {
  event.preventDefault()
  if(!file.path) {
    message.error('请稍等...')
    return
  }
  window.electron.startDrag(file.path)
  // event.dataTransfer.setData('fileId', file.id)
}

const dropFileTrans = async (event) => {
  event.preventDefault();
  const files = event.dataTransfer.files;
  for (let index = 0; index < files.length; index++) {
    const reader = new FileReader();
    const file = files[index];
    const uuid = crypto.randomUUID();
    fileData.list.push({id:uuid, name: file.name, size: file.size})
    reader.onload = (e) => {
      const fileContent = e.target.result;
      // 将文件内容传递到主进程进行处理
      console.log(1111111111, fileContent);
      
      window.electron.processFile({
        id: uuid,
        name: file.name,
        type: file.type,
        size: file.size,
        content: fileContent
      }, transFormat.value);
    };
    reader.readAsArrayBuffer(file);
  }
}

const dropFileMerge = (event) => {
  event.preventDefault();
  const files = [...event.dataTransfer.files];
  const checkRes = checkMergeFile(files)
  if (!checkRes.pass) {
    message.error(checkRes.info)
    return
  }
  const uuid = crypto.randomUUID();
  
  const vFile = files.find(item => item.type.includes('video'))
  fileData.list.push({id: uuid, name: vFile.name})
  for (let index = 0; index < files.length; index++) {
    const reader = new FileReader();
    const file = files[index];
    // fileData.list.push({id:uuid, name: file.name, size: file.size})
    reader.onload = async (e) => {
      const fileContent = e.target.result;
      
      // 将文件内容传递到主进程进行处理
      const data = await window.electron.uploadFile({
        id: uuid,
        name: file.name,
        type: file.type,
        size: file.size,
        content: fileContent
      }, 'temp');
      const newFile = fileData.list.find(item => item.id === data.id)
      if(file.type.includes('video')) newFile.vFilePath = data.path
      if(file.type.includes('audio')) newFile.aFilePath = data.path
      if(newFile.aFilePath && newFile.vFilePath) {
        window.electron.margeToMp4({...newFile})
      }
    };
    reader.readAsArrayBuffer(file);
  }
}

function checkMergeFile(files) {
  if (files.length !== 2) return {pass: false, info: '音视频文件同时拖入'}
  const typsStr = [...files].map(item => item.type).join(',')
  if(!typsStr.includes('video')) return {pass: false, info: '未发现视频文件'}
  if(!typsStr.includes('audio')) return {pass: false, info: '未发现音频文件'}
  return {pass: true, info: ''}
}

const init = async () => {
  // 获取录音设备列表:
  let list = await window.electron.getAudioDevices()
  list.sort((a,b) => b.includes('立体声混音') - a.includes('立体声混音'))
  deviceList.value = list
}
// 清理列表和缓存
const clearAll = () => {
  fileData.list = []
  window.electron.clearTempFile()
}
watch(formatVisible, (newValue, oldValue) => {
  if (newValue === false) {
    setTimeout(() => {
      expandedKeys.value = []
    }, 300); 
  }
});

onMounted(() => {
  window.electron.resizeWindow([400, 175])
  window.electron.onConversionProgress((data) => {
    const file = fileData.list.find(item => item.id === data.id)
    if (!file) return
    file.percent = Math.round(data.percent)
  });
  window.electron.onConversionFinish((data) => {
    const file = fileData.list.find(item => item.id === data.id)
    if (!file) return
    file.path = data.path
    file.percent = 100
    file.name = data.newFileName ? data.newFileName : file.name
  });
  window.electron.margeToMp4Finish((data) => {
    const file = fileData.list.find(item => item.id === data.id)
    file.path = data.path
    file.percent = 100
  })
  init()
});

onBeforeUnmount(() => {
  window.electron.removeAllListeners('onConversionProgress');
  window.electron.removeAllListeners('onConversionFinish');
  window.electron.removeAllListeners('margeToMp4Finish');
  window.electron.removeAllListeners('onUpSuccess');
});

</script>

<style scoped  lang="less">
.moveBar {
  margin-bottom: 2px;
  height: 10px;
  background-color: aliceblue;
  -webkit-app-region: drag;
}
.transMp4-main {
  width: auto;
  display: flex;
  flex-direction: row;
  // justify-content: space-evenly;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 5px;
  height: 100%;
  background-color: #f0f3ff;
  border-radius: 6px;
  padding: 5px;
  .transMp4-drop {
    margin-bottom: 0;
    background-color: #ffffff;
    min-height: 70px;
    height: 114px;
    width: 108px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center; /* 垂直居中 */
  }
  .transMp4-file {
    margin: 0px auto;
    list-style-type: none;
    width: 45%;
    max-height: 112px;
    flex-grow: 1;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0px;  /* 隐藏垂直滚动条 */
      height: 0px;  /* 隐藏水平滚动条 */
    }
    li {
      padding: 0;
      // border-bottom: 1px solid #ddd;
    }
  }
  .tool-bar {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    background-color: #d5dcfa;
    height: 112px;
    margin-left: 2px;
    border-radius: 3px;
    padding: 2px;
    .tool-item {
      margin-top: 10px;
    }
  }
  .formatSel {
    margin-top: 4px;
    margin-left: 0;
    width: 90%;
  }
}
ul {
  list-style-type: none; /* 去除默认的圆点 */
  padding-left: 0; /* 去除默认的左侧内边距 */
}

li {
  margin: 5px 0; /* 添加一些间距，方便查看 */
}
.delIcon {
  margin: auto 5px;
  &:hover {
    color: red;
  }
}
.downloadIcon {
  margin: auto;
  &:hover {
    color: rgb(116, 190, 255);
  }
}
.transMp4-FileName{
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  min-width: 7em;
  margin: auto 5px; 
  font-size: 0.8em;
  width: 100%;
}
.ant-tree-title {
  font-size: 0.5em;
}
.doActive {
  color: #f98008;
}
.maxStr {
  white-space: nowrap;       /* 禁止换行 */
  overflow: hidden;           /* 超出部分隐藏 */
  text-overflow: ellipsis;    /* 显示省略号 */
  max-width: 8em;           /* 设置最大宽度，可以根据需要调整 */
}
.deviceUl {
  margin: 1px auto;
  height: 100%;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 0px;  /* 隐藏垂直滚动条 */
    height: 0px;  /* 隐藏水平滚动条 */
  }
  li {
    border-radius: 3px;
    padding: 0 4px;
    &:hover {
      background-color: #d3daf8;
      cursor: default;
    }
  }
}
.selActive {
  // color: #baedff;
  background-color: #d3daf8;
}
</style>
