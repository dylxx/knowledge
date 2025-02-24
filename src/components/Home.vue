<template>
    <div class="main-search"><input type="text" title="请输入搜索" v-model="searchInput" ></div>
    <h1>{{ searchInput }}</h1>
</template>
  
  <script setup>
import { ref, reactive, computed } from "vue";

// 数据
const title = ref("Vue 3 模块");
let searchInput = ref("123")

const increment = () => {
    count.value++;
};
</script>
  
  <style scoped  lang="less">
h1 {
    color: #42b983;
}
.main-search {

}


</style>
  