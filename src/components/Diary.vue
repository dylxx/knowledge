<template  style="height: 200px">
  <div class="moveBar" ></div>
  <div style="display: flex; justify-content: space-evenly">
    <LeftOutlined @click="gotoMusic"/>
    <RollbackOutlined @click="backHome"/>
    <RightOutlined @click="gotoDiary"/>
  </div>
  <a-input v-model:value="searchInput" size="small"></a-input>
  <a-button @click="execCode">执行</a-button>
  <div>{{ result }}</div>
</template>

<script setup>
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount } from "vue";
// import { settingFilled, StarFilled, StarTwoTone } from 'ant-design/icons-vue';
import { LinkOutlined,UpOutlined,DownOutlined,DeleteOutlined,DownloadOutlined,UploadOutlined,RollbackOutlined,LeftOutlined,RightOutlined } from '@ant-design/icons-vue'
import { debounce } from 'lodash-es'
import { useRouter } from 'vue-router';
import { message } from "ant-design-vue";

// 数据
const router = useRouter();
let searchInput = ref('')
let result = ref('123123')

const execCode = async () => {
  result.value = await window.electron.execCode(searchInput.value)
}

const gotoMusic = () => {
  router.push('/soundEffects')
}

onBeforeUnmount(() => {
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {

})

</script>

<style scoped  lang="less">

</style>
