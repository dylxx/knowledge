<template>
  <div class="content-main">
    <div @mouseenter="showDrag = true" @contextmenu="showContextMenu($event)" class="cam-main" @wheel="wheelHandle($event)">
      <div class="drag-area">
        <img class="drag-img" src="../assets/nekosensen.png" alt="">
      </div>
      <div class="video-mask">
        <video 
          ref="videoRef" 
          autoplay
          playsinline
          class="cam-video"
          :style="videoStyle"
        ></video>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch,onUnmounted,computed, onMounted, onBeforeUnmount } from "vue";
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'
import Vue3DraggableResizable from 'vue3-draggable-resizable'

// 数据
const camSize = ref([150,150,1])
const showDrag = ref(false)
const camPosition = ref([0, 0]); // [x, y] 摄像头内容的偏移位置:百分比
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
  event.preventDefault()
  let rate = 10
  rate = event.deltaY > 0 ? rate*(-1) : rate
  camSize.value = [camSize.value[0] + rate, camSize.value[1] + rate*camSize.value[2], camSize.value[2]]
  window.electron.resizeWindow([camSize.value[0], camSize.value[1]])
}
onBeforeUnmount(() => {
  stopCamera();
});


const videoStyle = computed(() => {
  return {
    width: `${camSize.value[0]}px`,
    height: `${camSize.value[1]}px`,
    'object-position':`${camPosition.value[0]}% ${camPosition.value[1]}%`,
  };
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {
  startCamera()
})

</script>

<style scoped  lang="less">
.content-main {
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
.video-mask {
  border-radius: 50%;
  overflow: hidden; /* 隐藏超出圆形区域的部分 */
  .cam-video {
    border-radius: 50%; /* 这将创建圆形效果 */
    object-fit: cover;  /* 确保视频填充整个圆形区域 */
    object-position: 50% 50%; /* 水平20%，垂直居中 */
    display: block;
    margin: 0 0;
    border: solid 2px #ffffff;
    box-sizing: border-box;
    // -webkit-app-region: drag;
  }
}
.drag-area {
  position: fixed;
  width: 25%;
  height: 25%;
  right: 0;
  -webkit-app-region: drag;
  .drag-img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* 保持比例填充整个容器，可能裁剪 */
  }
}
</style>