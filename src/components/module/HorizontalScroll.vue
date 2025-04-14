<template>
  <div 
    class="horizontal-scroll-container"
    ref="container"
    @wheel="handleWheel"
  >
    <div class="scroll-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';


const container = ref(null);
const isScrolling = ref(false);
const scrollTimeout = ref(null);

// 处理滚轮事件
const handleWheel = (e) => {
  e.preventDefault();
  
  if (container.value) {
    // 水平滚动量（使用 deltaY 实现横向滚动）
    const scrollAmount = e.deltaY * 0.8;
    container.value.scrollLeft += scrollAmount;
    
    // 设置滚动状态（可用于添加样式效果）
    isScrolling.value = true;
    
    // 清除之前的定时器
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value);
    }
    
    // 设置新的定时器
    scrollTimeout.value = setTimeout(() => {
      isScrolling.value = false;
    }, 200);
  }
};

// 可选：防止在内容元素上滚动时冒泡
const preventScroll = (e) => {
  e.stopPropagation();
};

onMounted(() => {
  // 为所有子元素添加滚轮事件阻止
  if (container.value) {
    const children = container.value.querySelectorAll('.scroll-content > *');
    children.forEach(child => {
      child.addEventListener('wheel', preventScroll);
    });
  }
});

onBeforeUnmount(() => {
  // 清理事件监听
  if (container.value) {
    const children = container.value.querySelectorAll('.scroll-content > *');
    children.forEach(child => {
      child.removeEventListener('wheel', preventScroll);
    });
  }
  
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value);
  }
});
</script>

<style lang="less">
.horizontal-scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  scroll-behavior: smooth;
  cursor: grab;
  
  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }
  
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
  
  .scroll-content {
    display: inline-flex;
    height: 100%;
    
    // 子元素样式
    > * {
      flex: 0 0 auto;
      white-space: normal;
      margin-right: 16px; // 项目间距
      
      &:last-child {
        margin-right: 0;
      }
    }
  }
  
  // 滚动时的效果
  &.scrolling {
    cursor: grabbing;
  }
}
</style>