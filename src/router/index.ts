import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase'; 

import LoginView from '../views/LoginView.vue';
import BudgetView from '@/views/BudgetView.vue';
import FotoConfirmacionForm from '@/components/pedidos/FotoConfirmacionForm.vue';
import FotoConfirmacionList from '@/components/pedidos/FotoConfirmacionList.vue';
import EditarPedidoView from '@/views/EditarPedidoView.vue';
import SeleccionarFotosView from '@/views/SeleccionarFotosView.vue';
import FotoSubida from '@/components/pedidos/FotoSubida.vue';
import SeleccionView from '@/views/SelectionView.vue';
import GestionView from '@/views/GestionView.vue';
import ResetPasswordView from '../views/ResetPasswordView.vue'; // <-- 1. Importamos la vista de reseteo

const routes = [
  { path: '/login', component: LoginView },
  { path: '/calculadora', component: BudgetView },
  { path: '/gestion', name: 'Gestion', component: GestionView, meta: { requiresAuth: true } },
  { path: '/foto-pedidos', component: FotoConfirmacionList },
  { path: '/foto-pedidos/nuevo', component: FotoConfirmacionForm },
  { path: '/foto-pedidos/editar', component: EditarPedidoView },
  { path: '/foto-pedidos/seleccionar', name: 'SeleccionarFotos', component: SeleccionarFotosView},
  { path: '/foto-pedidos/subir', name: 'SubirFotos', component: FotoSubida, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/seleccion', name: 'Seleccion', component: SeleccionView, meta: { requiresAuth: true } }, 
  
  // 2. Ruta para capturar el reseteo de contraseña de Firebase
  { path: '/reset-password', component: ResetPasswordView },
  
  // Redirigir el inicio (/) directamente al login
  { path: '/', redirect: '/login' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Helper para convertir el estado asíncrono de Firebase en una Promesa
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

router.beforeEach(async (to, from, next) => {
  // Verificamos el usuario real en los servidores de Firebase
  const currentUser = await getCurrentUser();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // Si la ruta es privada y no hay usuario, lo mandamos al login
  if (requiresAuth && !currentUser) {
    next('/login');
  } 
  else {
    next();
  }
});

export default router;