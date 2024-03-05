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
        router.push('/admin');
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

    // Comprobar el estado de la sesión al cargar el componente
    if (!isLoggedIn.value) {
      logout();
    }

    return { username, password, login, logout, isLoggedIn };
  },
});
</script>


<style scoped>
.login-bar {
  display: flex; /* Hace que los elementos internos se alineen en una fila */
  align-items: center; /* Centra verticalmente los elementos */
  justify-content: center; /* Centra horizontalmente los elementos */
  max-width: 400px; /* Establece un ancho máximo para la barra de inicio de sesión */
  margin: 0 auto; /* Centra la barra horizontalmente */
}

.input-field {
  flex: 1; /* Los campos de entrada ocupan todo el espacio disponible */
  margin-right: 10px; /* Espacio entre los campos de entrada */
  padding: 8px; /* Espaciado interno */
  border: 1px solid #ccc; /* Borde */
  border-radius: 4px; /* Esquinas redondeadas */
  box-sizing: border-box; /* Incluir el borde y el relleno en el ancho total */
}

button {
  background-color: #007bff; /* Color de fondo */
  color: #fff; /* Color del texto */
  border: none; /* Sin borde */
  padding: 8px 16px; /* Espaciado interno */
  border-radius: 4px; /* Esquinas redondeadas */
  cursor: pointer; /* Cursor de apuntar */
  transition: background-color 0.3s; /* Transición suave */
}

button:hover {
  background-color: #0056b3; /* Cambio de color al pasar el ratón */
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
