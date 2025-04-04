<template  style="height: 200px">
  <a-button @click.stop="closeWin">关闭</a-button>
  <div
    ref="floatBox"
    class="floating-box"
    :style="{ top: position.top + 'px', left: position.left + 'px' }"
  >
    提示框
  </div>
</template>

<script setup>
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount } from "vue";
import "../style/main.less";

// 数据
const BOX_WIDTH = 100;
const BOX_HEIGHT = 50;
const OFFSET_X = 30;
const OFFSET_Y = 40;

const position = ref({ top: 0, left: 0 });
const floatBox = ref(null);
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

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', updatePosition);
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {
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
</style>
