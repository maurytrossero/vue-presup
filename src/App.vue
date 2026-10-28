<template>
  <div id="app">
    <nav class="navbar">
      <!-- Título principal -->
      <div class="brand">{{ nombreEmpresaGlobal }}</div>      
      <ul class="nav-links" :class="{ 'nav-active': menuOpen }">
        <!-- Botón X para cerrar en móvil -->
        <li class="close-btn" @click="menuOpen = false">✖</li>

        <!-- Enlaces del sistema -->
        <li>
          <router-link to="/calculadora" @click="menuOpen = false">Calculadora</router-link>
        </li>
        
        <!-- Solo visible si el administrador (tú) está logueado -->
        <li v-if="isAuthenticated">
          <router-link to="/gestion" @click="menuOpen = false">Panel de Gestión</router-link>
        </li>

        <!-- Botones de Autenticación -->
        <li v-if="!isAuthenticated">
          <router-link to="/login" class="btn-login" @click="menuOpen = false">Iniciar Sesión</router-link>
        </li>
        <li v-if="isAuthenticated">
          <a href="#" class="btn-logout" @click.prevent="logout">Cerrar Sesión</a>
        </li>
      </ul>

      <div class="burger" @click="menuOpen = !menuOpen">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { obtenerConfigUsuario } from '@/services/presupuestoService'; // <-- Se importó el servicio correctamente

const menuOpen = ref(false);
const isAuthenticated = ref(false);
const router = useRouter();
const auth = getAuth();

// Escucha en tiempo real si hay sesión iniciada en Firebase
const nombreEmpresaGlobal = ref('Cargando...');

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      isAuthenticated.value = true;
      // Si hay un usuario logueado, buscamos su perfil
      const configGuardada = await obtenerConfigUsuario(user.uid);
      
      if (configGuardada && configGuardada.nombre_empresa) {
        // Muestra la marca del colega
        nombreEmpresaGlobal.value = configGuardada.nombre_empresa;
      } else if (user.email === 'mtproduccioneshd@gmail.com') {
        // Tu cuenta por defecto
        nombreEmpresaGlobal.value = 'MT Producciones';
      } else {
        // Colega nuevo sin configurar
        nombreEmpresaGlobal.value = 'Panel de Gestión';
      }
    } else {
      // Si nadie inició sesión (pantalla de Login)
      isAuthenticated.value = false;
      nombreEmpresaGlobal.value = 'Sistema de Presupuestos';
    }
  });
}); // <-- Faltaba cerrar el onMounted aquí

const logout = async () => {
  try {
    await signOut(auth);
    menuOpen.value = false;
    router.push('/login');
  } catch (error) {
    console.error("Error al cerrar sesión", error);
  }
};
</script>

<style scoped>
/* Fuente base para la navbar */
.navbar,
.nav-links li a,
.brand {
  font-family: 'Inter', sans-serif;
}

/* Barra principal */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2563eb;
  padding: 0 1.5rem;
  height: 60px;
  color: white;
  position: relative;
  z-index: 200;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* Logo (Brand) */
.brand {
  font-weight: 700;
  font-size: 1.5rem;
  color: white;
}

/* Links de navegación - desktop */
.nav-links {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  margin: 0;
  padding: 0;
}

.nav-links li a {
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 0.8rem;
  border-radius: 0.4rem;
  transition: background-color 0.2s;
}

.nav-links li a:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.btn-login { background-color: #10b981; }
.btn-login:hover { background-color: #059669 !important; }
.btn-logout { background-color: #ef4444; }
.btn-logout:hover { background-color: #dc2626 !important; }

/* Botón X - oculto por defecto en desktop */
.nav-links .close-btn {
  display: none;
}

/* Burger menu */
.burger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
  z-index: 300;
}

.burger div {
  width: 28px;
  height: 3px;
  background-color: white;
  border-radius: 2px;
}

/* Responsive mobile */
@media (max-width: 768px) {
  .nav-links {
    position: fixed;
    right: 0;
    top: 0;
    height: 100vh;
    width: 240px;
    background-color: #2563eb;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.3s ease-in;
    padding-top: 2.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
    overflow-y: auto;
    box-shadow: -4px 0 10px rgba(0,0,0,0.2);
    z-index: 100;
  }

  .nav-links.nav-active {
    transform: translateX(0);
  }

  /* Botón X */
  .nav-links .close-btn {
    display: flex;
    align-self: flex-end;
    justify-content: center;
    align-items: center;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: white;
    color: #2563eb;
    font-size: 1.4rem;
    font-weight: bold;
    margin-bottom: 2rem;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }

  .nav-links li {
    margin-bottom: 1rem;
    width: 100%;
  }

  .nav-links li a {
    display: block;
    width: 100%;
    text-align: center;
    padding: 1rem;
    background-color: rgba(255,255,255,0.1);
  }

  .burger {
    display: flex;
  }
}
</style>