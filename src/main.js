import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import Antd from "ant-design-vue";
import router from './router';
import "./style/main.less";

const app = createApp(App)
app.use(Antd)
app.use(router)
app.mount('#app')
// createApp(App).mount('#app')