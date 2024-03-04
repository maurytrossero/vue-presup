<template>
  <form @submit.prevent="login">
    <input v-model="username" type="text" placeholder="Usuario" />
    <input v-model="password" type="password" placeholder="Contraseña" />
    <button type="submit">Iniciar sesión</button>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'Login',
  setup() {
    const username = ref('');
    const password = ref('');
    const router = useRouter();

    const login = () => {
      // Verificar las credenciales
      if (username.value === 'admin' && password.value === 'admin') {
        // Credenciales válidas, redirigir a la sección de administración
        router.push('/admin');
      } else {
        // Credenciales inválidas, mostrar un mensaje de error
        console.error('Credenciales incorrectas');
      }
    };

    return { username, password, login };
  },
});
</script>
