// src/router/index.js
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Manage from '../components/Manage.vue';
import VideoTool from '../components/VideoTool.vue';
import Diary from '../components/Diary.vue';
import SoundEffects from "../components/SoundEffects.vue";

const routes = [
  { path: '/',name:'Home', component: Home },
  { path: '/manage',name:'Manage', component: Manage },
  { path: '/videoTool', name:'videoTool', component: VideoTool},
  { path: '/diary', name:'diary', component: Diary},
  { path: '/soundEffects', name:'soundEffects', component: SoundEffects}
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
