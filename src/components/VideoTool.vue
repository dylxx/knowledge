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
            <div class="transMp4-FileName" style="margin: auto 5px; font-size: 0.8em"  draggable="true" @dragstart="onDragStartFile($event,file)">{{ file.name }}</div>
            <a-progress :percent="file.percent" size="small" style="margin: auto" />
            <!-- <DeleteOutlined class="delIcon" @click="deleteFile(file)"  /> -->
            <!-- <DownloadOutlined v-if="file.convert" @click="downlaodFile(file)" class="downloadIcon"/> -->
          </div>
        </li>
      </ul>
      <div class="tool-bar">
        <a-tooltip>
          <a-popover v-model:open="formatVisible" trigger="click" placement="leftTop">
            <template #content>
              <div style="height: 70px">
                <a-tree
                 class="scoll"
                  v-model:selectedKeys="selectedKeys"
                  v-model:expandedKeys="expandedKeys"
                  :tree-data="treeData"
                  @select="selTree"
                >
                </a-tree>
              </div>
            </template>
            <CalculatorOutlined class="hoverActive" />
          </a-popover>
        </a-tooltip>
        <DeleteOutlined class="clear-tool" title="清理列表和缓存" @click="clearAll"/>
        <RetweetOutlined class="hoverActive" title="下一个" @click="gotoPage('next')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount,watchEffect } from "vue";
// import { settingFilled, StarFilled, StarTwoTone } from 'ant-design/icons-vue';
import { LinkOutlined,CalculatorOutlined,RetweetOutlined,DownOutlined,DeleteOutlined,DownloadOutlined,UploadOutlined,RollbackOutlined,LeftOutlined,RightOutlined } from '@ant-design/icons-vue'
import { debounce } from 'lodash-es'
import { useRouter } from 'vue-router';
import { message } from "ant-design-vue";
import "../style/main.less";

// 数据
const router = useRouter();
const fileData = reactive({list:[]})
const expandedKeys = ref(['']);
const selectedKeys = ref(['']);
let tool = reactive({
  curr: 0,
  max: 1
})
let formatVisible = ref(false)
const treeData = [
  {title: '视频', key: '视频',children:[
      {title: 'mp4', key: 'mp4'},
    ]
  },
  {title: '音频', key: '音频',children:[
      {title: 'mp3', key: 'mp3'},
    ]
  },
  {title: '图片', key: '图片',children:[
      {title: 'png', key: 'png'},
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
    reader.onload = (e) => {
      const fileContent = e.target.result;
      
      // 将文件内容传递到主进程进行处理
      window.electron.uploadFile({
        id: uuid,
        name: file.name,
        type: file.type,
        size: file.size,
        content: fileContent
      }, 'temp');
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
// 清理列表和缓存
const clearAll = () => {
  fileData.list = []
  window.electron.clearTempFile()
}

onMounted(() => {
  window.electron.resizeWindow([400, 175])
  window.electron.onUpSuccess((data) => {
    // 只有音视频组合才执行
    if (tool.curr !== 1) return
    const file = fileData.list.find(item => item.id === data.id)
    if(data.type.includes('video')) file.vFilePath = data.path
    if(data.type.includes('audio')) file.aFilePath = data.path
    if(file.aFilePath && file.vFilePath) {
      window.electron.margeToMp4({...file})
    }
  })
  window.electron.onConversionProgress((data) => {
    const file = fileData.list.find(item => item.id === data.id)
    if (!file) return
    file.percent = Math.round(data.percent)
  });
  window.electron.onConversionFinish((data) => {
    console.log(11111, data);
    
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
    justify-content: space-evenly;
    background-color: #d5dcfa;
    height: 112px;
    margin-left: 2px;
    border-radius: 3px;
    padding: 2px;
    .clear-tool:hover {
      color: #ff6262;
    }
    .next-tool:hover {
      color: rgb(116, 190, 255);
    }
    .pre-tool:hover {
      color: rgb(116, 190, 255);
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
  max-width: 9em;
  min-width: 3em;
}
</style>
