<template>
  <div id="app">
    <nav class="navbar">
      <div class="logo">Hace tu pedido online</div>
        <ul class="nav-links" :class="{ 'nav-active': menuOpen }">
          <!-- Solo visible si el usuario está logueado -->
          <li v-if="isAuthenticated">
            <router-link to="/foto-pedidos">Listado de pedidos</router-link>
          </li>

          <li><router-link to="/foto-pedidos/nuevo">Nuevo Pedido de fotos</router-link></li>
          <li><router-link to="/foto-pedidos/editar">Editar Pedido de fotos</router-link></li>
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

<script>
export default {
  data() {
    return {
      menuOpen: false,
    };
  },
  computed: {
    isAuthenticated() {
      // Suponiendo que guardas el token en localStorage
      return localStorage.getItem('token') !== null;
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('role'); // si guardas rol
      this.$router.push('/login');
    }
  }
};
</script>


<style scoped>
/* Fuente base para la navbar */
.navbar,
.nav-links li a,
.logo {
  font-family: 'Inter', sans-serif; /* misma fuente que el formulario */
}

/* Barra principal */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2563eb; /* color sólido */
  padding: 0 1.5rem;
  height: 60px;
  color: white;
}

/* Logo */
.logo {
  font-weight: 700;
  font-size: 1.5rem;
  color: white;
}

/* Links de navegación */
.nav-links {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links li a {
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 0.4rem 0.6rem;
  border-radius: 0.4rem;
  transition: background-color 0.2s;
}

.nav-links li a:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Burger menu */
.burger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
}

.burger div {
  width: 28px;
  height: 3px;
  background-color: white;
  border-radius: 2px;
}

/* Responsive */
@media (max-width: 600px) {
  .nav-links {
    position: fixed;
    right: 0;
    height: 100vh;
    top: 0;
    background-color: #2563eb; /* mismo color sólido */
    flex-direction: column;
    width: 220px;
    transform: translateX(100%);
    transition: transform 0.3s ease-in;
    padding-top: 80px;
  }

  .nav-links.nav-active {
    transform: translateX(0);
  }

  .burger {
    display: flex;
  }
}

</style>
