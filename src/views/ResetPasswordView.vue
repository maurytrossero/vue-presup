<template>
  <div class="reset-page">
    <div class="reset-box">
      <div class="brand-icon">🔑</div>
      <h2>Restablecer Contraseña</h2>
      <p class="reset-sub">Ingresa tu nueva contraseña para continuar</p>

      <form @submit.prevent="actualizarContrasena" class="form-clean">
        <div class="field-group">
          <label>Nueva Contraseña</label>
          <input v-model="nuevaPassword" type="password" placeholder="Mínimo 6 caracteres" required class="control-input" />
        </div>

        <button type="submit" class="btn-submit" :disabled="cargando">
          {{ cargando ? 'Guardando...' : 'Guardar Nueva Contraseña' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/services/firebase';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const nuevaPassword = ref('');
const cargando = ref(false);

const actualizarContrasena = async () => {
  // El enlace que envía Firebase trae un parámetro llamado 'oobCode' por la URL
  const oobCode = route.query.oobCode as string;

  if (!oobCode) {
    return Swal.fire('Error', 'Enlace de recuperación inválido o expirado.', 'error');
  }

  if (nuevaPassword.value.length < 6) {
    return Swal.fire('Atención', 'La contraseña debe tener al menos 6 caracteres.', 'warning');
  }

  cargando.value = true;
  try {
    // Confirmamos el reseteo con Firebase Auth
    await confirmPasswordReset(auth, oobCode, nuevaPassword.value);
    
    await Swal.fire({
      icon: 'success',
      title: '¡Contraseña Actualizada!',
      text: 'Ya puedes iniciar sesión con tu nueva contraseña.',
      confirmButtonColor: '#2563eb'
    });

    router.push('/login');
  } catch (error: any) {
    Swal.fire('Error', 'El enlace ha expirado o ya fue utilizado. Solicita uno nuevo.', 'error');
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
.reset-page {
  background-color: #f8f9fa;
  min-height: calc(100vh - 60px);
  color: #333;
  font-family: 'Inter', sans-serif;
  padding: 40px 20px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
}

.reset-box {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 35px 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  text-align: center;
}

.brand-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.reset-box h2 {
  margin: 0 0 5px 0;
  color: #1e293b;
  font-size: 22px;
}

.reset-sub {
  color: #64748b;
  font-size: 13px;
  margin-bottom: 25px;
}

.form-clean {
  display: flex;
  flex-direction: column;
  gap: 15px;
  text-align: left;
}

.field-group label {
  display: block;
  font-size: 12px;
  font-weight: bold;
  color: #475569;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.control-input {
  width: 100%;
  padding: 10px 12px;
  background-color: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #333;
  font-size: 14px;
  box-sizing: border-box;
}

.control-input:focus {
  border-color: #2563eb;
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.btn-submit {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  margin-top: 5px;
  transition: background 0.2s;
}

.btn-submit:hover {
  background-color: #1d4ed8;
}
</style>