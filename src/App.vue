<template>
    <div id="app">
      <FloatingBall />
    </div>
  </template>
  
  <script>
  // 导入悬浮球组件
  import FloatingBall from './components/FloatingBall.vue';
  
  export default {
    name: 'App',
    components: {
      FloatingBall,
    },
  };
  </script>
  
<style>
#app {
    text-align: center;
}
</style>
