// src/router/index.js
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Manage from '../components/Manage.vue';

const routes = [
  { path: '/',name:'Home', component: Home },
  { path: '/manage',name:'Manage', component: Manage },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
