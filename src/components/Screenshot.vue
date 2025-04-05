<template>
  <div>
    <canvas
      ref="canvas"
      @mousemove="onMouseMove"
      @contextmenu.prevent="copyColor('hex')"
      @click="copyColor('rgb')"
      style="width: 100%;height: 100%"
    />
    <div
      class="info-box"
      :style="{ top: infoPos.top + 'px', left: infoPos.left + 'px' }"
    >
      <!-- <canvas 
        ref="pixelCanvas"
        style="width: 10px;height: 10px"
      ></canvas> -->
      <!-- <div class="grid-container">
        <div 
          v-for="(item, index) in gridItems" 
          :key="index"
          class="grid-item"
          :class="{'center-cell': index === pixArea.center-1}"
          :style="{ backgroundColor: item.color }"
        ></div>
      </div> -->
      <canvas
        ref="miniCanvas"
        style="width: 100px;height: 70px"
        :width="300"
        :height="200"
      >
      </canvas>
      <div>{{ pixelInfo.rgb }}</div>
      <div style="display: flex;justify-content: center">
        <div style="width: 12px;height: 12px;margin: auto 5px" :style="`background-color:${pixelInfo.hex}`"></div>
        <span>{{ pixelInfo.hex }}</span>
      </div>
      <div>左键复制rgb</div>
      <div>右键复制hex</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from 'vue-router';
import "../style/main.less";

// 数据
const pixArea = {
  total: 31*17,
  widthside: 31,
  heightside: 17,
  widthHalf: 15,
  heigthHalf: 9,
  center: 264
}
const route = useRoute();
const canvas = ref(null);
const miniCanvas = ref(null)
const gridItems = ref(
  Array(pixArea.total).fill().map(() => ({
    color: '#333' // 默认颜色
  }))
);
const infoPos = ref({ top: 0, left: 0, space: 20});
const pixelInfo = reactive({
  rgb: 'rgb(0,0,0)',
  hex:  '#000000',
  x:0,
  y:0
});

let ctx = null;
let miniCtx = null

const BOX_WIDTH = 100;
const BOX_HEIGHT = 50;
const OFFSET_X = 30;
const OFFSET_Y = 40;

const position = ref({ top: 0, left: 0 });
const floatBox = ref(null);



// 绘制一个红色矩形
// 方法
const updatePosition = (e) => {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  let top, left;

  const rightOverflow = e.clientX + OFFSET_X + BOX_WIDTH > screenW;
  const bottomOverflow = e.clientY + OFFSET_Y + BOX_HEIGHT > screenH;
  const leftOverflow = e.clientX - OFFSET_X - BOX_WIDTH < 0;
  const topOverflow = e.clientY - OFFSET_Y - BOX_HEIGHT < 0;

  if (!rightOverflow && !bottomOverflow) {
    // ✅ 默认右下
    left = e.clientX + OFFSET_X;
    top = e.clientY + OFFSET_Y;
  } else if (rightOverflow && !bottomOverflow) {
    // ⬅️ 左下
    left = e.clientX - OFFSET_X - BOX_WIDTH;
    top = e.clientY + OFFSET_Y;
  } else if (!rightOverflow && bottomOverflow) {
    // ⬆️ 右上
    left = e.clientX + OFFSET_X;
    top = e.clientY - OFFSET_Y - BOX_HEIGHT;
  } else {
    // ⬅️⬆️ 左上
    left = e.clientX - OFFSET_X - BOX_WIDTH;
    top = e.clientY - OFFSET_Y - BOX_HEIGHT;
  }

  // 防止过界（极限情况下也能回到屏幕内）
  left = Math.max(0, Math.min(left, screenW - BOX_WIDTH));
  top = Math.max(0, Math.min(top, screenH - BOX_HEIGHT));

  position.value = { top, left };
};
const closeWin = () => {
  window.electron.createShotWindow({win:'close'})
}
const onMouseMove = (e) => {
  const rect = canvas.value.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left)/window.screen.width*canvas.value.width);
  const y = Math.floor((e.clientY - rect.top)/window.screen.height*canvas.value.height);
  // 获取像素数据
  setInfoPos(x,y, e.clientX, e.clientY)
  // infoPos.value = { top: e.clientY + 20, left: e.clientX + 20 };
  const data = ctx.getImageData(x, y, 1, 1).data;
  setMiniColor2(x,y)
  const [r, g, b, a] = data;
  pixelInfo.rgb = `rgb(${r},${g},${b})`
  pixelInfo.hex = rgbToHex(r,g,b)
  // 设置 infoBox 显示位置（略偏移）
};

const setInfoPos = async (x,y, ex, ey) => {
  const space = infoPos.value.space
  const width = 100, height = 140
  let place = [true,true]
  place[0] = canvas.value.width > x + infoPos.value.space + width
  place[1] = canvas.value.height > y + infoPos.value.space + height
  infoPos.value.top = place[1] ? (ey + space) : ey - space - height
  infoPos.value.left = place[0] ? (ex + space) : ex - space - width
  console.log(111, place);
}

// 画图
const createShotImg = async () => {
  let image = new Image();
  image.crossOrigin = 'anonymous'; // 跨域时需要
  const imgBuffer = await window.electron.getShotPhoto()
  const blob = new Blob([imgBuffer], {type: 'image/png'})
  const blobUrl = URL.createObjectURL(blob)
  image.onload = () => {
    // 画图
    ctx = canvas.value.getContext('2d');
    canvas.value.width = image.width;
    canvas.value.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);
    URL.revokeObjectURL(blobUrl)
  };
  image.src = blobUrl

}

const rgbToHex = (r, g, b) => {
  // 确保数值在 0-255 范围内
  const clamp = (value) => Math.max(0, Math.min(255, value));
  const hexR = clamp(r).toString(16).padStart(2, '0');
  const hexG = clamp(g).toString(16).padStart(2, '0');
  const hexB = clamp(b).toString(16).padStart(2, '0');
  return `#${hexR}${hexG}${hexB}`.toUpperCase(); // 转为大写（可选）
}


const setMiniColor2 = (x = 100, y = 200, width = 31, height = 17) => {
  console.log(111, miniCanvas.width,miniCanvas.height);
  console.log(222, width);
  
  miniCtx.clearRect(0, 0, miniCanvas.value.width, miniCanvas.value.height);
  // 2. 从主Canvas截取指定区域，绘制到小Canvas（可控制是否平滑）
  miniCtx.imageSmoothingEnabled = false; // 关闭抗锯齿（像素风放大）
  miniCtx.drawImage(
    canvas.value, // 源Canvas
    x-pixArea.widthHalf, y-pixArea.heigthHalf, width, height,       // 主Canvas上的源区域 (100,200,80,60)
    0, 0, miniCanvas.value.width, miniCanvas.value.height // 放大到小Canvas的完整尺寸
  );

  // 中心点
  const rectSize = 15; // 矩形边长
  const centerX2 = miniCanvas.value.width / 2 - rectSize / 2;
  const centerY2 = miniCanvas.value.height / 2 - rectSize / 2;
  miniCtx.strokeStyle = 'cyan';
  miniCtx.lineWidth = 2;
  miniCtx.strokeRect(centerX2, centerY2, rectSize, rectSize);
  // 边线
  miniCtx.fillStyle = 'rgba(0, 122, 204, 0.3)'
  miniCtx.fillRect(0, centerY2, centerX2, rectSize)
  miniCtx.fillRect(centerX2, 0, rectSize, centerY2)
  miniCtx.fillRect(centerX2, centerY2+rectSize, rectSize, centerY2)
  miniCtx.fillRect(centerX2+rectSize, centerY2, centerX2, rectSize)
}
const copyColor = async (type) => {
  await navigator.clipboard.writeText(pixelInfo[type])
  window.electron.createShotWindow({win:'close'})
}
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', updatePosition);
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(async () => {
  await createShotImg()
  miniCtx = miniCanvas.value.getContext('2d')
  window.addEventListener('mousemove', updatePosition);
})

</script>

<style scoped  lang="less">
.main-screen {
  height: 1000px;
  width: 1000px;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 0px;  /* 隐藏垂直滚动条 */
    height: 0px;  /* 隐藏水平滚动条 */
  }
  background-color: aliceblue;
}
.floating-box {
  position: fixed;
  width: 100px;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  pointer-events: none;
  border-radius: 6px;
  padding: 5px;
  z-index: 9999;
  transition: top 0.05s ease-out, left 0.05s ease-out;
}
.info-box {
  position: fixed;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  pointer-events: none;
  z-index: 1000;
}
// :global(body) {
//   margin: 0;
//   padding: 0;
// }
.grid-container {
  display: grid;
  grid-template-columns: repeat(31, 1fr);
  grid-template-rows: repeat(17, 1fr);
  background-color: white;
  gap: 0px;
  width: 200px;
  height: 100px;
  border: none;
  // border: 1px solid white;
}
.grid-item {
  padding: -1px;
}
.grid-item.center-cell {
  border: 1px solid gold; /* 金色边框 */
  box-sizing: border-box; /* 确保边框不影响尺寸 */
}
</style>
