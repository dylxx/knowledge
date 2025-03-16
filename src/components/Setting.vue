<template style="height: 100%">
    <div style="margin: 15px 0">
      <span class="setting-name" >快捷键: </span>
      <a-radio-group size="small" v-model:value="minHot">
        <a-radio-button  value="Alt+c">Alt+c</a-radio-button>
        <a-radio-button value="Alt+v">Alt+v</a-radio-button>
      </a-radio-group>
    </div>
    <div style="display: flex">
      <span class="setting-name" >密码: </span>
      <a-input-password :visibility-toggle="false" size="small" v-model:value="pin" style="margin: auto 3px" :placeholder="placeholder"></a-input-password>
      <a-button v-if="!showPwdMenu" size="small" @click="cliPwdShow(true)"><UnlockOutlined/></a-button>
      <a-button v-if="showPwdMenu" size="small" @click="cliPwdShow(false)"><LockOutlined/></a-button>
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
import { SettingOutlined,UnlockOutlined,LockOutlined } from '@ant-design/icons-vue'
import { debounce } from 'lodash-es'
import { useRouter } from 'vue-router';
import anime from 'animejs';

// 数据
const emit = defineEmits(['unlockPwd'])
let minHot = ref('Alt+c')
let settings = reactive({
  conf:{}
})
let pin = ref('')
let showPwdMenu = ref(false)
let placeholder = ref('输入pin')
// methods
const reset = async () => {

}
const init = async () => {
  const cMinHot = await window.electron.getConf('minHot')
  minHot.value = cMinHot
}
const cliPwdShow = (show) => {
  console.log(pin.value);
  const cPin = '4869'
  if (show && pin.value === cPin) {
    showPwdMenu.value = true
    emit('unlockPwd', true)
  }else if (show && pin.value !== cPin) {

  } else {
    showPwdMenu.value = false
    emit('unlockPwd', false)
  }
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
  margin: 3px;
  display: flex;
  justify-content: space-evenly;
  button {
    margin-top: auto;
    margin-bottom: 10px
  }
}
.setting-name {
  font:  0.8em/1.5 'Arial', sans-serif;
  white-space: nowrap;
  margin: auto 3px;

}
</style>
  