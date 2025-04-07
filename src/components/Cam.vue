<template>
  <div class="content-main">
    <div @mouseenter="showDrag = true" @contextmenu="showContextMenu($event)" class="cam-main" @wheel="wheelHandle($event)">
      <div class="drag-area"></div>
      <video 
        ref="videoRef" 
        autoplay
        playsinline
        class="cam-video"
        :style="videoStyle"
        @dblclick="setDragCam"
        @mousedown="handleKeyDown"
        @mouseup="handleKeyUp"
      ></video>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch,onUnmounted,computed, onMounted, onBeforeUnmount } from "vue";
import "../style/main.less";

// 数据
const camSize = ref([150,150,1])
const dragCam = ref(false)
const showDrag = ref(false)
const isCtrlPressed = ref(false);
const camPosition = ref([0, 0]); // [x, y] 摄像头内容的偏移位置
// const dragStyle = ref({
//   width:'120px',
//   height: '120px'
// })
const viewport = ref({
  x: 0,          // 当前显示区域的X偏移
  y: 0,          // 当前显示区域的Y偏移
  scale: 1,      // 当前缩放比例
  isDragging: false, // 是否正在拖动
  startX: 0,     // 拖动起始X
  startY: 0,     // 拖动起始Y
  originalX: 0,  // 拖动前X偏移
  originalY: 0   // 拖动前Y偏移
});
const videoRef = ref(null)
let stream = null
// 方法
const startCamera = async () => {
  try {
    // 请求摄像头访问权限
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    })
    
    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
  } catch (error) {
    console.error('摄像头访问错误:', error)
    alert('无法访问摄像头: ' + error.message)
  }
}
const setDragCam = () => {
  dragCam.value = !dragCam.value
}
// const dragStyle = computed(() => {
//   console.log(camSize);
//   return {
//     width: `${camSize[0]}px`,
//     height: `${camSize[1]}px`
//   }
// })
const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    if (videoRef.value) {
      videoRef.value.srcObject = null
    }
    stream = null
  }
}
const wheelHandle = (event) => {
  console.log(111, isCtrlPressed.value);
  
  event.preventDefault()
  if (isCtrlPressed.value) {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // 计算鼠标在视频内容中的位置
    const contentX = viewport.value.x + mouseX / viewport.value.scale;
    const contentY = viewport.value.y + mouseY / viewport.value.scale;
    
    // 计算缩放因子
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(viewport.value.scale + delta, 5));
    
    // 计算新的偏移量以保持鼠标下的内容不变
    viewport.value.x = contentX - (mouseX / newScale);
    viewport.value.y = contentY - (mouseY / newScale);
    
    // 限制边界
    constrainViewport();
    viewport.value.scale = newScale;
  } else {
    let rate = 10
    rate = event.deltaY > 0 ? rate*(-1) : rate
    camSize.value = [camSize.value[0] + rate, camSize.value[1] + rate*camSize.value[2], camSize.value[2]]
    window.electron.resizeWindow([camSize.value[0], camSize.value[1]])
  }
}
const resizeWindow = (width, height) => {
  window.electron.resizeWindow([width, height])
  camSize.value = [width, height]
}
onBeforeUnmount(() => {
  stopCamera();
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});


const handleKeyDown = (e) => {
  if (e.key === 'Control') {
    isCtrlPressed.value = true;
  }
};

const handleKeyUp = (e) => {
  if (e.key === 'Control') {
    isCtrlPressed.value = false;
  }
};

const videoStyle = computed(() => {
  const scale = viewport.value.scale;
  return {
    width: `${camSize.value[0]}px`,
    height: `${camSize.value[1]}px`,
  };
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  startCamera()
})

</script>

<style scoped  lang="less">
.content-main {
  background-color: #fff;
  width: auto;
  height: auto;
  display: flex;
  flex-direction: column; /* 也可以是 row，但 column 垂直更自然 */
  justify-content: center; /* 垂直居中 */
  align-items: center; /* 添加这行使内容居中 */
  min-width: 0; /* 解决 flex 最小尺寸问题 */
  min-height: 0; /* 解决 flex 最小尺寸问题 */
}
.cam-main {
  display: flex;
  flex-direction: column;
  margin: 0;
  min-width: 0; /* 重要：允许缩小 */
  min-height: 0; /* 重要：允许缩小 */
  overflow: hidden; /* 防止内容溢出 */
  // background-color: rgba(0, 0, 0, 0.9);
}
.cam-video {
  border-radius: 50%; /* 这将创建圆形效果 */
  object-fit: cover;  /* 确保视频填充整个圆形区域 */
  object-position: 20% 50%; /* 水平20%，垂直居中 */
  display: block;
  margin: 0 0;
  background-color: rgba(0, 0, 0, 0);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3); /* 可选：添加阴影效果 */
  // -webkit-app-region: drag;
}
.drag-area {
  position: fixed;
  width: 20px;
  height: 20px;
  right: 0;
  -webkit-app-region: drag;
  background-color: rgb(216, 255, 242,0.5);
}
</style>