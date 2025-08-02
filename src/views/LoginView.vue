<template>
  <div class="login-bar">
    <template v-if="!isLoggedIn">
      <input v-model="username" type="text" placeholder="Usuario" class="input-field" />
      <input v-model="password" type="password" placeholder="Contraseña" class="input-field" />
      <button @click.prevent="login">Ingresar</button>
    </template>
    <template v-else>
      <div class="logged-in-message">
        <p>¡El administrador está logueado!</p>
        <button @click.prevent="logout">Cerrar Sesión</button>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const username = ref('');
    const password = ref('');
    const router = useRouter();
    const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true');

    const instance = getCurrentInstance();

    const emitLoginEvent = (loggedIn: boolean) => {
      if (instance) {
        instance.emit('login', loggedIn); // Emitir evento de inicio de sesión
      }
    };

    const login = () => {
      // Verificar las credenciales
      if (username.value === 'admin' && password.value === 'admin') {
        // Credenciales válidas, redirigir a la sección de administración
        router.push('/presupuestos');
        emitLoginEvent(true); // Emitir evento de inicio de sesión
        isLoggedIn.value = true; // Establecer como logueado
        localStorage.setItem('isLoggedIn', 'true'); // Guardar en el almacenamiento local
      } else {
        // Credenciales inválidas, mostrar un mensaje de error
        console.error('Credenciales incorrectas');
      }
    };


    const logout = () => {
      // Limpiar datos de autenticación y redirigir a la página de inicio de sesión
      isLoggedIn.value = false;
      localStorage.setItem('isLoggedIn', 'false'); // Actualizar el estado en el almacenamiento local
      emitLoginEvent(false); // Emitir evento de cierre de sesión
      router.push('/login');
    };

    // NO redirigir automáticamente si no está logueado
    // Solo emitir evento al padre
    emitLoginEvent(isLoggedIn.value === true);


    return { username, password, login, logout, isLoggedIn };
  },
});
</script>


<style scoped>
.login-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%; /* Cambiado a máximo ancho posible */
  margin: 0 auto;
  padding: 0 20px; /* Añadido un poco de espacio a los lados */
}

.input-field {
  flex: 1;
  margin-right: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  max-width: 120px; /* Reducir el ancho máximo de los inputs */
}

button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  max-width: 100px; /* Reducir el ancho máximo del botón */
}

button:hover {
  background-color: #0056b3;
}

.logged-in-message {
  text-align: center;
  display: flex;
  align-items: center;
}

.logged-in-message p {
  margin: 0;
  margin-right: 10px;
}
</style>
