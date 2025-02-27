<template>
  <div class="main-content" ref="mainContent">
    <a-space class="input-search">
      <a-button @click="gotoManage" size="small"><SettingOutlined /></a-button>
      <a-input size="small" v-model:value="searchInput" @input="onSearch" >
      </a-input>
    </a-space>
    <div><span class="desc-text">知识库软件 | dylink</span></div>
    <a-list class="main-list" size="small" bordered :data-source="dataList" :split="false" style="border: none" :locale="{emptyText: '暂无数据'}">
      <template #renderItem="{ item }">
        <div class="list-item">
          <a-list-item>{{ item.title }}</a-list-item>
        </div>
      </template>
    </a-list>
  </div>

</template>
  
  <script setup>
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount } from "vue";
import { message } from "ant-design-vue";
import FileUpload from "./FileUpload.vue";
// import { settingFilled, StarFilled, StarTwoTone } from 'ant-design/icons-vue';
import { SettingOutlined } from '@ant-design/icons-vue'
import { debounce } from 'lodash-es'
import { useRouter } from 'vue-router';

// 数据
let searchInput = ref("");
let dataList = reactive([])
const mainContent = ref(null)
const router = useRouter();
// methods
// 搜索框
const onSearch =  debounce(async () => {
  dataList.length = 0
  if (!searchInput.value) return
  console.log('searchInput: ', searchInput.value);
  const result = await window.electron.onSearch({keyword: searchInput.value, page: 1})
  dataList.push(...result.list)
  // dataList.push(...fakeList.filter(item => item.label.includes(searchInput.value))) 
  console.log('datalist: ', dataList.length);
  
}, 300);

const gotoManage = () => {
  router.push('/manage').catch(error => {
    console.log('error: ', error);
    
  });
}


onMounted(() => {

});

onBeforeUnmount(() => {
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {
  if (mainContent.value) {
    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        // const size = {width: 500.1231232132, height: 300}
        const size = {width: Math.ceil(entry.contentRect.width) + 20, height: Math.ceil(entry.contentRect.height) + 30}
        console.log('新的宽度:', size.width, '新的高度:', size.height)
        window.electron.resizeWindow(size)
      })
    })

    // 开始观察 DOM 元素
    resizeObserver.observe(mainContent.value)

    // 清理函数，组件卸载时停止观察
    onUnmounted(() => {
      resizeObserver.disconnect()
    })
  }
})

</script>
  
  <style scoped  lang="less">
h1 {
  color: #42b983;
}
.tag-select {
  margin: 1em auto;
}
.main-content {
  width: 220px;
  margin: 0 auto;
  -webkit-app-region: drag;
  .input-search {
    -webkit-app-region: no-drag;
    background-color: #B1B2FF;
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 0.5em auto;
    padding: 0.5em;
    border-radius: 10px;
    button {
      margin: 0;
    }
  }
  .main-list {
    -webkit-app-region: no-drag;
  }
}
.desc-text {
  font-size: 0.8em;
  color: #aaaaaa;
}
.list-item {
  width: auto;
  height: auto;
  &:hover {
    background-color: #D2DAFF;
    border-radius: 10px;
  }
}
</style>
  