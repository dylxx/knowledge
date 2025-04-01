<template>
  <NaviBar/>
  <div class="content-main">
    <div class="item">0</div>
    <div @click="cliOne">1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
    <div>5</div>
    <div>6</div>
  </div>
  <div>---------------</div>
</template>
  
<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router';
import { message } from "ant-design-vue";
import "../style/main.less";
import { LinkOutlined,CaretDownOutlined,DeliveredProcedureOutlined,CalculatorOutlined,
  RetweetOutlined,DeleteOutlined,UploadOutlined,RollbackOutlined,LeftOutlined,RightOutlined } from '@ant-design/icons-vue'
import NaviBar from "./module/NaviBar.vue";
const router = useRouter();
const menuItems = ref([
  { text: "NEWS", link: "#" },
  { text: "STAFF&CAST", link: "#" },
  { text: "STORY", link: "#" },
  { text: "ON AIR", link: "#" },
  { text: "CHARACTER", link: "#" },
  { text: "GOODS", link: "#" },
  { text: "Blu-ray/DVD", link: "#" },
  { text: "MOVIE", link: "#" },
  { text: "SPECIAL", link: "#" },
  { text: "HERE", link: "#" },
]);

const characters = ref([
  "Character 1",
  "Character 2",
  "Character 3",
  "Character 4",
  "Character 5",
  "Character 6",
  "Character 7",
  "Character 8",
]);
const cliOne = () => {
  console.log(111, router);
  
}
const backHome = () => {
  router.push('/')
}
</script>
  
<style scoped lang="less">
.content-main { // 父元素div
  display: grid; //定义网格布局
  grid-template-columns: minmax(100px, 1fr)  2fr 1fr 1fr; 
  // minmax定义最小, 最大尺寸
  // fr: 平均分配剩余空间
  // 表示四列, 第一列最小100px, 第二列占2份空间
  gap: 10px; // 间距
  &:div {
    // width: auto;
  }
  .item { // 子元素div
    grid-column: 1/4; // 该元素占用3个列
    grid-row: 1/3; // 该元素占用3个行
  }
}
</style>