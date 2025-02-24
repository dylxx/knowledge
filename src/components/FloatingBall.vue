<template>
    <div class="floating-ball" 
    :style="{ top: position.top + 'px', left: position.left + 'px' }"
    @mousedown="startDrag">
      <!-- 输入框 -->
      <div class="input-box"  >
        <input type="text" v-model="inputValue" placeholder="请输入..." />
      </div>
        <!-- 悬浮球内容 -->
    </div>
</template>
  
  <script setup>
import { ref } from "vue";

// 数据
const title = ref("Vue 3 模块");
const count = ref(0);
let position = ref({top: 100, left: 100})
let isDragging = ref(false)
let dragOffset = ref({x: 0, y: 0})
let isHovered = ref(false)
let inputValue = ref('')

const increment = () => {
    count.value++;
};

const startDrag = (event) => {
    console.log(event.target.classList);
    
    if (!event.target.classList.contains('floating-ball')) {
        // 如果点击的是子元素 B，不执行拖拽逻辑
        return
    }
    dragOffset.value.x = event.clientX - position.value.left;
    dragOffset.value.y = event.clientY - position.value.top;
    
    
    // 监听鼠标移动和松开事件
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
}

const onDrag = (event) => {
    if (isDragging) {
    position.value.left = event.clientX - dragOffset.value.x;
    position.value.top = event.clientY - dragOffset.value.y;
    }
}

const stopDrag = () => {
      isDragging.value = false;
      // 移除事件监听
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
    }
</script>
  
  <style scoped  lang="less">
h1 {
    color: #42b983;
}

@ball-size: 60px;
.floating-ball {
  position: fixed;
  top: 50px;
  left: 50px;
  z-index: 2; /* 确保悬浮球始终在最上层 */
  width: @ball-size;
  height: @ball-size;
  cursor: grab; // 拖拽时显示抓取光标
  user-select: none; // 防止拖拽时选中文本
  border-radius: 50%;
  background-color: #7abfff;
  background-image: url("../assets/eye.png"); /* @ 是 Vue CLI 默认的别名，指向 src 目录 */
  background-position: center; /* 设置图片居中 */
  background-size: cover; /* 使背景图片填充整个圆形 */
  cursor: pointer;
  transition: transform 0.1s ease-in-out; /* 添加平滑过渡效果 */
  box-shadow: 4px 4px 8px rgba(54, 123, 250, 0.4); /* 设置投影效果，产生立体感 */
  &:active {
    cursor: grabbing; // 拖拽时改变光标
  }
  &:hover {
    transform: scale(1.1); /* 放大悬浮球 */
    box-shadow: 6px 6px 12px rgba(54, 123, 250, 0.6); /* 增强投影效果 */
  }
}
.floating-ball:hover .input-box {
  width: 150px;
  visibility: visible;
  z-index: 1;
}

@input-height:30px;
.input-box {
  position: absolute;
  top: 50% - @input-height * 0.5;
  left: 100%-5px;  /* 输入框位置在悬浮球的右边 */
  width: 0px;
  height: @input-height;
  // margin-left: 10px;  /* 与悬浮球有一定间隔 */
  visibility: hidden;
  transition: all 0.3s ease;  /* 平滑过渡 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  /* 输入框样式 */
  input {
    width: 100%;
    height: 100%;
    padding: 5px;
    border: 1px solid #ccc;
    font-size: 14px;
    border-radius: @input-height * 0.5;
    background-color: rgb(214, 228, 254);
    box-shadow: 4px 4px 8px rgba(54, 123, 250, 0.4);
    &:focus {
      outline:2px solid #7abfff;
    }
  }

}

// html, body {
//   margin: 0;
//   padding: 0;
//   height: 100%;
//   background: transparent; /* 设置透明背景 */
//   overflow: hidden; /* 禁止滚动条 */
// }
</style>
  