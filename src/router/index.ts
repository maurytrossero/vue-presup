import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import BudgetView from '@/views/BudgetView.vue';
import FotoConfirmacionForm from '@/components/pedidos/FotoConfirmacionForm.vue';
import FotoConfirmacionList from '@/components/pedidos/FotoConfirmacionList.vue';
import EditarPedidoView from '@/views/EditarPedidoView.vue';

const routes = [
  { path: '/login', component: LoginView },
  { path: '/calculadora', component: BudgetView },

  // Estas rutas NO requieren login
  { path: '/foto-pedidos', component: FotoConfirmacionList, meta: { requiresAuth: true } },
  { path: '/foto-pedidos/nuevo', component: FotoConfirmacionForm },
  { path: '/foto-pedidos/editar', component: EditarPedidoView },

  { path: '/', redirect: '/calculadora' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ✅ Debug info del router completo
console.log('[Router creado]', router);
console.log('[Rutas definidas]', routes);

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (to.path === '/login' && isAuthenticated) {
    next('/calculadora'); // o /presupuestos si quieres
  } else if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login'); // bloquea rutas privadas si no hay token
  } else {
    next(); // deja pasar las rutas públicas
  }
});


export default router;
