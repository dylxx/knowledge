<template>
    <div id="app">
      <Home />
    </div>
  </template>
  
  <script>
  import Home from './components/Home.vue';
  
  export default {
    name: 'App',
    components: {
        Home,
    },
  };
  </script>
  
<style>
#app {
    text-align: center;
}
</style>
