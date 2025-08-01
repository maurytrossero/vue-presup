import { createRouter, createWebHashHistory } from 'vue-router'; // <-- cambiás esto
import LoginView from '../views/LoginView.vue';
import BudgetView from '@/views/BudgetView.vue';
import FotoConfirmacionForm from '@/components/pedidos/FotoConfirmacionForm.vue';
import FotoConfirmacionList from '@/components/pedidos/FotoConfirmacionList.vue';

const routes = [
  { path: '/login', component: LoginView },
  { path: '/presupuestos', component: BudgetView, meta: { requiresAuth: true } },
  { path: '/foto-pedidos', component: FotoConfirmacionList, meta: { requiresAuth: true } },
  { path: '/foto-pedidos/nuevo', component: FotoConfirmacionForm, meta: { requiresAuth: true } },
  { path: '/', redirect: '/presupuestos' },
  {
    path: '/foto-pedidos/editar',
    name: 'EditarPedido',
    component: () => import('@/views/EditarPedidoView.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(), // <-- esta línea hace el cambio efectivo
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (to.path === '/login' && isAuthenticated) {
    next('/presupuestos');
  } else if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
