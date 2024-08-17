import { createRouter, createWebHistory } from 'vue-router';


import Home from '@/pages/home/Home.vue';
import Detail from '@/pages/detail/Detail.vue';
import Guide from '@/pages/guide/Guide.vue';
import Me from '@/pages/me/me.vue';
import FileAnalysis from '@/components/FileAnalysis.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/detail',
    name: 'detail',
    component: Detail,
  },
  {
    path: '/guide',
    name: 'guide',
    component: Guide,
  },
  {
    path: '/me',
    name: 'me',
    component: Me,
  },
  {
    path: '/file',
    name: 'fileAnalysis',
    component: FileAnalysis,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


export default router;