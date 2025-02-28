<template>
  <div>
    <h1>上传文件并转码</h1>
    <input type="file" @change="onFileChange" />
    <button @click="uploadFile" :disabled="!selectedFile">上传文件</button>

    <div v-if="uploading">上传中...</div>
    <div v-if="convertedFile">
      <a :href="convertedFile" target="_blank">下载转码后的视频</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

    // 使用 Vue 3 的 Composition API
    const selectedFile = ref(null);
    const uploading = ref(false);
    const convertedFile = ref(null);

    // 处理文件选择
    const onFileChange = (event) => {
      selectedFile.value = event.target.files[0];
    };

    // 上传文件并通知主进程开始转码
    const uploadFile = () => {
      if (!selectedFile.value) {
        alert('请先选择文件');
        return;
      }

      const filePath = selectedFile.value.path;
      uploading.value = true;

      // 使用 electron API 发送文件路径到主进程
      console.log('filepath: ' + filePath);
      window.electron.send('start-conversion', filePath);

      // 监听转码完成的事件
      window.electron.receive('conversion-complete', (convertedFilePath) => {
        uploading.value = false;
        if (convertedFilePath === '转码失败') {
          alert('转码失败');
        } else {
          convertedFile.value = convertedFilePath; // 设置转码后的文件路径
        }
      });
    };

    const handleDrop = (e) => {
      console.log('e: ', e);
      
    }

    // 返回需要在模板中访问的变量和方法
    // return {
    //   selectedFile,
    //   uploading,
    //   convertedFile,
    //   onFileChange,
    //   uploadFile,
    // };
</script>

<style scoped>
/* 你可以根据需要添加样式 */
</style>
