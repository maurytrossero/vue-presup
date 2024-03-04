// router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Login from '@/components/Login.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/admin',
    redirect: '/login', // Redirige todas las peticiones a /admin a /login
  },
  // Otras rutas...
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
