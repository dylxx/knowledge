// src/router/index.js
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Manage from '../components/Manage.vue';
import VideoTool from '../components/VideoTool.vue';
import Diary from '../components/Diary.vue';
import SoundEffects from "../components/SoundEffects.vue";
import TomatoClock from "../components/TomatoClock.vue";
import Screenshot from "../components/Screenshot.vue";

const routes = [
  { path: '/',name:'Home', component: Home },
  { path: '/manage',name:'Manage', component: Manage },
  { path: '/videoTool', name:'videoTool', component: VideoTool},
  { path: '/diary', name:'diary', component: Diary},
  { path: '/soundEffects', name:'soundEffects', component: SoundEffects},
  { path: '/tomatoClock', name:'tomatoClock', component: TomatoClock},
  { path: '/screenshot', name:'screenshot', component: Screenshot},
];

const toolLine = [
  '/videoTool',
  '/soundEffects',
  '/tomatoClock',
  '/diary'
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  toolLine,
});

export default router;
