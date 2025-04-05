<template>
  <div>
    <canvas
      ref="canvas"
      @mousemove="onMouseMove"
      @click="closeWin"
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
      <div class="grid-container">
        <div 
          v-for="(item, index) in gridItems" 
          :key="index"
          class="grid-item"
          :class="{'center-cell': index === pixArea.center-1}"
          :style="{ backgroundColor: item.color }"
        ></div>
      </div>
      <div>{{ pixelInfo.info }}</div>
      <div>{{ pixelInfo.rgb }}</div>
      <div>{{ pixelInfo.hex }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from 'vue-router';
import "../style/main.less";

// 数据
const pixArea = {
  total: 81,
  side: 9,
  half: 4,
  center: 41
}
const route = useRoute();
const canvas = ref(null);
// const imageUrl = encodeURI('../public/test.png')
const gridItems = ref(
  Array(pixArea.total).fill().map(() => ({
    color: '#333' // 默认颜色
  }))
);
const infoPos = ref({ top: 0, left: 0 });
const pixelInfo = reactive({
  rgb: '',
  hex:  '#000000',
  info: '',
  x:0,
  y:0
});

let ctx = null;

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
  console.log(11111,x);
  // 获取像素数据
  const data = ctx.getImageData(x, y, 1, 1).data;
  setMiniColor(x,y)
  console.log('data数据::::', data);
  
  const [r, g, b, a] = data;
  pixelInfo.info = `R:${r} G:${g} B:${b} A:${a}`;
  pixelInfo.rgb = `(${r},${g},${b})`
  pixelInfo.hex = rgbToHex(r,g,b)
  // 设置 infoBox 显示位置（略偏移）
  infoPos.value = { top: e.clientY + 20, left: e.clientX + 20 };
};

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
    ctx.drawImage(image, 0, 0, image.width, image.height - 100);
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

const setMiniColor = (x,y) => {
  const data = ctx.getImageData(x-pixArea.half, y-pixArea.half, pixArea.side, pixArea.side).data
    // imageData.data 是Uint8ClampedArray，结构为[R,G,B,A,R,G,B,A,...]
    const pixels = [];
  
  // 提取5×5像素的RGB值（忽略Alpha通道）
  for (let i = 0; i < pixArea.total; i++) {
    const offset = i * 4; // 每个像素占4个位置（RGBA）
    pixels.push({
      r: data[offset],
      g: data[offset + 1],
      b: data[offset + 2]
    });
  }

  // 转换为Hex并更新网格
  gridItems.value = pixels.map(pixel => {
    return {color: rgbToHex(pixel.r, pixel.g, pixel.b)}
  });
}
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', updatePosition);
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(async () => {
  await createShotImg()
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
:global(body) {
  margin: 0;
  padding: 0;
}
.grid-container {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(9, 1fr);
  background-color: white;
  gap: 0px;
  width: 100px;
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
