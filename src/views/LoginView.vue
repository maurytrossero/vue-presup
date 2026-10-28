<template>
  <div class="dashboard-page-light">
    
    <!-- ========================================== -->
    <!-- CASO 1: USUARIO NO LOGUEADO (FORMULARIO) -->
    <!-- ========================================== -->
    <div v-if="!isLoggedIn" class="login-wrapper">
      <div class="login-box">
        <div class="login-brand-icon">🔐</div>
        <h2>Acceso al Sistema</h2>
        <p class="login-sub">Ingresa tus credenciales para continuar</p>

        <form @submit.prevent="login" class="form-login-clean">
          <div class="field-group">
            <label>Correo Electrónico</label>
            <input v-model="email" type="email" placeholder="correo@ejemplo.com" required class="control-input" />
          </div>

          <div class="field-group">
            <label>Contraseña</label>
            <input v-model="password" type="password" placeholder="••••••••" required class="control-input" />
          </div>

          <button type="submit" class="btn-submit-login" :disabled="cargando">
            {{ cargando ? 'Iniciando sesión...' : 'Ingresar' }}
          </button>
        </form>

        <div class="forgot-pass">
          <a href="#" @click.prevent="recuperarPassword">¿Olvidaste tu contraseña?</a>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- CASO 2: USUARIO LOGUEADO (DASHBOARD CLARO) -->
    <!-- ========================================== -->
    <div v-else class="dashboard-container">
      
      <!-- ENCABEZADO SUPERIOR DEL DASHBOARD -->
      <div class="dash-topbar">
        <div class="dash-user-info">
          <h1>Panel de Control</h1>
          <p>{{ emailUsuario }} <span class="role-badge">ADMIN</span></p>
        </div>
        <div class="dash-top-actions">
          <button class="btn-logout-top" @click="logout">Cerrar sesión</button>
        </div>
      </div>

      <!-- TARJETAS DE NAVEGACIÓN RÁPIDA -->
      <div class="dash-grid">
        
        <!-- Tarjeta Gestión Financiera -->
        <div class="dash-card" @click="$router.push('/gestion')">
          <div class="card-icon-wrapper green-bg">
            📊
          </div>
          <div class="card-content">
            <h3>Gestión Financiera</h3>
            <p>Control de eventos, cobros, saldos pendientes y emisión de recibos PDF profesionales.</p>
          </div>
        </div>

        <!-- Tarjeta Calculadora -->
        <div class="dash-card" @click="$router.push('/calculadora')">
          <div class="card-icon-wrapper blue-bg">
            🧮
          </div>
          <div class="card-content">
            <h3>Calculadora de Presupuestos</h3>
            <p>Armado de presupuestos dinámicos para 15 años, bodas, egresados y eventos personalizados.</p>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';
import Swal from 'sweetalert2';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const email = ref('');
    const password = ref('');
    const cargando = ref(false);
    const emailUsuario = ref('');
    const router = useRouter();
    const isLoggedIn = ref(false);

    const instance = getCurrentInstance();
    const emitLoginEvent = (loggedIn: boolean) => {
      instance?.emit('login', loggedIn);
    };

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          isLoggedIn.value = true;
          emailUsuario.value = user.email || '';
          localStorage.setItem('isLoggedIn', 'true');
        } else {
          isLoggedIn.value = false;
          emailUsuario.value = '';
          localStorage.setItem('isLoggedIn', 'false');
        }
      });
    });

    const login = async () => {
      if (!email.value || !password.value) {
        return Swal.fire('Atención', 'Completa todos los campos.', 'warning');
      }

      cargando.value = true;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
        isLoggedIn.value = true;
        emailUsuario.value = userCredential.user.email || '';
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('token', await userCredential.user.getIdToken()); 
        
        emitLoginEvent(true);
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Sesión iniciada con éxito.',
          timer: 1200,
          showConfirmButton: false
        });
      } catch (error: any) {
        let mensaje = 'Credenciales incorrectas.';
        if (error.code === 'auth/user-not-found') mensaje = 'Usuario no encontrado.';
        if (error.code === 'auth/wrong-password') mensaje = 'Contraseña incorrecta.';
        Swal.fire('Error de Acceso', mensaje, 'error');
      } finally {
        cargando.value = false;
      }
    };

    const recuperarPassword = async () => {
      if (!email.value) {
        return Swal.fire('Ingresa tu correo', 'Escribe tu correo en el campo superior antes de solicitar la recuperación.', 'info');
      }
      try {
        await sendPasswordResetEmail(auth, email.value);
        Swal.fire('Correo enviado', 'Revisa tu bandeja para restablecer tu contraseña.', 'success');
      } catch (error) {
        Swal.fire('Error', 'No se pudo enviar el correo de recuperación.', 'error');
      }
    };

    const logout = async () => {
      try {
        await signOut(auth);
        isLoggedIn.value = false;
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.removeItem('token'); 
        emitLoginEvent(false);
      } catch (error) {
        console.error("Error al cerrar sesión", error);
      }
    };

    return { 
      email, 
      password, 
      login, 
      logout, 
      recuperarPassword,
      isLoggedIn, 
      cargando,
      emailUsuario
    };
  },
});
</script>

<style scoped>
/* Contenedor general en modo claro */
.dashboard-page-light {
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

/* ========================================== */
/* ESTILOS PARA EL LOGIN CLARO */
/* ========================================== */
.login-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 35px 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  text-align: center;
}

.login-brand-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.login-box h2 {
  margin: 0 0 5px 0;
  color: #1e293b;
  font-size: 22px;
}

.login-sub {
  color: #64748b;
  font-size: 13px;
  margin-bottom: 25px;
}

.form-login-clean {
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

.btn-submit-login {
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

.btn-submit-login:hover {
  background-color: #1d4ed8;
}

.forgot-pass {
  margin-top: 20px;
  text-align: center;
}

.forgot-pass a {
  color: #2563eb;
  font-size: 13px;
  text-decoration: none;
}

.forgot-pass a:hover {
  text-decoration: underline;
}

/* ========================================== */
/* ESTILOS PARA EL DASHBOARD CLARO */
/* ========================================== */
.dashboard-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  align-self: flex-start;
}

.dash-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.dash-user-info h1 {
  margin: 0;
  font-size: 24px;
  color: #1e293b;
}

.dash-user-info p {
  margin: 5px 0 0 0;
  color: #64748b;
  font-size: 13px;
}

.role-badge {
  background-color: #e0f2fe;
  color: #0369a1;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  margin-left: 8px;
}

.btn-logout-top {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-logout-top:hover {
  background-color: #dc2626;
}

/* Cuadrícula de tarjetas en modo claro */
.dash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.dash-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 25px;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.04);
}

.dash-card:hover {
  transform: translateY(-4px);
  border-color: #2563eb;
  box-shadow: 0 6px 15px rgba(0,0,0,0.08);
}

.card-icon-wrapper {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.green-bg { background-color: #d1fae5; color: #059669; }
.blue-bg { background-color: #dbeafe; color: #2563eb; }

.card-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #1e293b;
}

.card-content p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}
</style>