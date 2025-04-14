<template>
  <div class="drag bar-content" style="display: flex; justify-content: space-evenly">
    <RollbackOutlined class="hoverActive no-drag" @click="goto('/')"/>
      <a-popover class="tool-bar" trigger="hover" placement="bottom" :mouseLeaveDelay="0.3">
        <template #content>
          <div class="bar-list drag">
            <PlaySquareOutlined class="hoverActive no-drag bar-item" @click="goto('videoTool')" />
            <SoundOutlined  class="hoverActive no-drag bar-item" @click="goto('soundEffects')"/>
            <ScheduleOutlined  class="hoverActive no-drag bar-item" @click="goto('tomatoClock')"/>
            <HeartOutlined  class="hoverActive no-drag bar-item" @click="goto('relation')" />
          </div>
        </template>
        <BarsOutlined class="hoverActive no-drag"/>
      </a-popover>
    <a-popover class="tool-bar" trigger="hover" size="small" placement="bottom" :mouseLeaveDelay="0.3">
      <template #content>
        <div class="bar-list drag">
          <BgColorsOutlined class="hoverActive no-drag bar-item" @click="absorbColor()" />
          <VideoCameraOutlined  class="hoverActive no-drag bar-item" @click="openCamWindow"/>
        </div>
      </template>
      <DeploymentUnitOutlined class="hoverActive no-drag"/>
    </a-popover>
    <!-- <a-tooltip class="tool-item">
      <a-popover trigger="hover" v-model:open="formatVisible" placement="leftTop">
        <template #content >
          <div v-for="(converType, tIndex) in treeData" :key="tIndex" style="margin-bottom: 3px">
            <span class="conver-sel-type">{{ converType.title }}</span>
            <span class="conver-sel-item" :class="{'sel-cover-active':conver.key===transFormat}" v-for="(conver, index) in converType.children" :key="index" @click="selCoverType(conver.key)">{{ conver.title }}</span>
          </div>
        </template>
        <MenuFoldOutlined class="hoverActive"/>
      </a-popover>
    </a-tooltip> -->
    <CloseOutlined class="hoverActive no-drag" @click="hideWin"/>
  </div>
</template>

<script setup>
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from 'vue-router';
import { VideoCameraOutlined,BarsOutlined,DeploymentUnitOutlined,CloseOutlined,RollbackOutlined,LeftOutlined,HomeOutlined,SoundOutlined,ScheduleOutlined,BgColorsOutlined,PlaySquareOutlined,HeartOutlined } from '@ant-design/icons-vue'


// 数据
const tooltipVisible = ref(false)
const router = useRouter();
// 方法
const hideWin = () => {
  window.electron.hideWin()
}
const goto = (uri) => {
  router.push(uri)
}
const absorbColor = () => {
  window.electron.createShotWindow({win:'create'})
}
const openCamWindow = async () => {
  window.electron.camWindowHandle({win:'create'})
}
onBeforeUnmount(() => {
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {

})

</script>

<style scoped  lang="less">
.bar-list {
  display: flex;
  justify-content: space-evenly;
  gap: 10px;
  margin: 5px;
}
.bar-content {
  margin: 5px;
}

// .bar-item {
//   margin: ;
// }
</style>
