// router/index.ts
import { createRouter, createWebHistory, RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import BudgetView from '@/views/BudgetView.vue';


const routes = [
  { path: '/login', component: LoginView },
  // Otras rutas de tu aplicación
  { path: '/presupuestos', component: BudgetView }, // Nueva ruta para BudgetView
  { path: '/', redirect: '/budget' } // Redirigir la ruta raíz a /budget
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const isAuthenticated = localStorage.getItem('token') !== null; // Verificar si hay un token de autenticación en el almacenamiento local
  if (to.path !== '/login' && !isAuthenticated) {
    next('/login'); // Redirigir al usuario a la página de inicio de sesión si no está autenticado
  } else {
    next(); // Continuar con la navegación
  }
});

export default router;
