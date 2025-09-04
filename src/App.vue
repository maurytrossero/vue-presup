<template>
  <div id="app">
    <nav class="navbar">
      <div class="logo">Hace tu pedido online</div>
        <ul class="nav-links" :class="{ 'nav-active': menuOpen }">
          <li v-if="!isAuthenticated">
            <router-link to="/login">Login</router-link>
          </li>
          <li v-else>
            <a href="#" @click.prevent="logout">Logout</a>
          </li>

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
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 0 20px;
  height: 50px;
  color: white;
}

.logo {
  font-weight: bold;
  font-size: 1.2em;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 20px;
}

.nav-links li a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.nav-links li a:hover {
  color: #ddd;
}

/* Burger menu - hidden en desktop */
.burger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
}

.burger div {
  width: 25px;
  height: 3px;
  background-color: white;
}

/* Responsivo */
@media (max-width: 600px) {
  .nav-links {
    position: fixed;
    right: 0;
    height: 100vh;
    top: 0;
    background-color: #333;
    flex-direction: column;
    width: 200px;
    transform: translateX(100%);
    transition: transform 0.3s ease-in;
    padding-top: 60px;
  }

  .nav-links.nav-active {
    transform: translateX(0);
  }

  .burger {
    display: flex;
  }
}
</style>
