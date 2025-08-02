<template>
  <div id="app">
    <nav class="navbar">
      <div class="logo">Mi App</div>
      <ul class="nav-links" :class="{ 'nav-active': menuOpen }">
        <li><router-link to="/login">Login</router-link></li>
        <li><router-link to="/presupuestos">Presupuestos</router-link></li>
        <li><router-link to="/foto-pedidos">Foto Pedidos</router-link></li>
        <li><router-link to="/foto-pedidos/nuevo">Nuevo Foto Pedido</router-link></li>
        <li><router-link to="/foto-pedidos/editar">Editar Pedido</router-link></li>
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
