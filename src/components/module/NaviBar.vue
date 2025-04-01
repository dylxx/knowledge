<template>
  <div class="moveBar" ></div>
  <div style="display: flex; justify-content: space-evenly">
    <LeftOutlined class="hoverActive" @click="gotoPre" />
    <RollbackOutlined class="hoverActive" @click="backHome"/>
    <RightOutlined class="hoverActive" @click="gotoDiary"/>
  </div>
</template>

<script setup>
import {onMounted, onBeforeUnmount } from "vue";
import { useRouter } from 'vue-router';
import { RollbackOutlined,LeftOutlined,RightOutlined } from '@ant-design/icons-vue'
import "../../style/main.less";

// 数据
const router = useRouter();
const gotoPre = () => {
  const currIndex = router.options.toolLine.findIndex(item => item === router.currentRoute.value.path)
  if (currIndex === 0) return
  const nextPath = router.options.toolLine[currIndex - 1]
  router.push(nextPath)
}
const backHome = () => {
  router.push('/')
}
const gotoDiary = () => {
  const currIndex = router.options.toolLine.findIndex(item => item === router.currentRoute.value.path)
  if (currIndex === router.options.toolLine.length - 1) return
  const nextPath = router.options.toolLine[currIndex + 1]
  router.push(nextPath)
}

onBeforeUnmount(() => {
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {

})

</script>

<style scoped  lang="less">

</style>
