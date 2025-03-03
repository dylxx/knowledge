<template style="height: 100%">
    <div style="margin: 15px 0">
      <span style="font:  0.8em/1.5 'Arial', sans-serif;">快捷键: </span>
      <a-radio-group size="small" v-model:value="minHot">
        <a-radio-button  value="Alt+c">Alt+c</a-radio-button>
        <a-radio-button value="Alt+v">Alt+v</a-radio-button>
      </a-radio-group>
    </div>
    <div class="apply-reset">
      <a-button size="small" @click="reset">重置</a-button>
      <a-button size="small" @click="toSetting">设置</a-button>
    </div>
</template>
  
  <script setup>
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount } from "vue";
import { message } from "ant-design-vue";
// import { settingFilled, StarFilled, StarTwoTone } from 'ant-design/icons-vue';
import { SettingOutlined } from '@ant-design/icons-vue'
import { debounce } from 'lodash-es'
import { useRouter } from 'vue-router';
import anime from 'animejs';

// 数据
let minHot = ref('Alt+c')
let settings = reactive({
  conf:{}
})
// methods
const init = async () => {
  const config = await window.electron.getConfig()
  settings.conf = config
  minHot.value = config.minHot
  console.log('config', settings.conf);
}
const toSetting = async () => {
  await window.electron.setConfig(config)
}

onMounted(() => {
  init()
});

onBeforeUnmount(() => {
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {

})

</script>
  
<style scoped  lang="less">
.apply-reset {
  display: flex;
  justify-content: space-evenly;
  button {
    margin-top: auto;
    margin-bottom: 10px
  }
}
</style>
  