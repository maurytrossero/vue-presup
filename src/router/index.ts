import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import BudgetView from '@/views/BudgetView.vue';
import FotoConfirmacionForm from '@/components/pedidos/FotoConfirmacionForm.vue';
import FotoConfirmacionList from '@/components/pedidos/FotoConfirmacionList.vue';
import EditarPedidoView from '@/views/EditarPedidoView.vue';

const routes = [
  { path: '/login', component: LoginView },
  { path: '/presupuestos', component: BudgetView, meta: { requiresAuth: true } },

  // Estas rutas NO requieren login
  { path: '/foto-pedidos', component: FotoConfirmacionList },
  { path: '/foto-pedidos/nuevo', component: FotoConfirmacionForm },
  { path: '/foto-pedidos/editar', component: EditarPedidoView },

  { path: '/', redirect: '/presupuestos' }
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

  console.log('[Navegación]');
  console.log('→ Desde:', from.fullPath);
  console.log('→ Hacia:', to.fullPath);
  console.log('→ Requiere auth:', to.meta.requiresAuth === true);
  console.log('→ Está autenticado:', isAuthenticated);

  if (to.path === '/login' && isAuthenticated) {
    console.log('→ Ya autenticado, redirigiendo a /presupuestos');
    next('/presupuestos');
  } else if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('→ No autenticado, redirigiendo a /login');
    next('/login');
  } else {
    next();
  }
});

export default router;
