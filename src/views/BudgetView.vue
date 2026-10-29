<template>
  <div class="app-container">
    <div class="background-overlay" :style="{ backgroundImage: `url(${backgroundImage})` }"></div>

    <div class="logo-container">
      <img :src="logoImage" alt="Logo MT Producciones" class="logo-image" />
    </div>

    <div class="container">
      <h1>Producción de Foto / Video Profesional</h1>

      <!-- PANEL GLOBAL DE PRECIOS (Solo Admin) -->
      <div v-if="isAdminLoggedIn" class="admin-panel">
        <div class="admin-header">
          <h3>⚙️ Precios Base Globales (Guardados en la Nube)</h3>
          <button class="btn-guardar-config" @click="guardarPreciosEnBD" :disabled="guardando">
            {{ guardando ? 'Guardando...' : '💾 Guardar Global' }}
          </button>
        </div>
        
        <div class="inputs-grid">
          <div class="input-group">
            <label>Precio Base (2 Hs)</label>
            <div class="input-prefix"><span>$</span><input v-model.number="configGlobal.precioBase" type="number" /></div>
          </div>
          <div class="input-group">
            <label>Costo Hora Extra</label>
            <div class="input-prefix"><span>$</span><input v-model.number="configGlobal.costoHoraExtra" type="number" /></div>
          </div>
          <div class="input-group">
            <label>Inflación Anual</label>
            <div class="input-prefix"><span>%</span><input v-model.number="configGlobal.inflacionAnual" type="number" /></div>
          </div>
          <div class="input-group">
            <label>Costo por KM</label>
            <div class="input-prefix"><span>$</span><input v-model.number="configGlobal.costoKm" type="number" /></div>
          </div>
        </div>
      </div>

      <!-- NUEVO: DATOS DEL CLIENTE Y EVENTO -->
      <div class="admin-panel cliente-panel">
        <div class="admin-header">
          <h3>👤 Datos del Cliente / Evento (Opcional)</h3>
        </div>
        <div class="inputs-grid">
          <div class="input-group">
            <label>Cliente (Contacto)</label>
            <input v-model="datosCliente.cliente_nombre" placeholder="Ej: Familia López" />
          </div>
          <div class="input-group">
            <label>Título del Evento</label>
            <input v-model="datosCliente.titulo_evento" placeholder="Ej: Los 15 de Angy" />
          </div>
          <div class="input-group">
            <label>Teléfono Cliente</label>
            <input v-model="datosCliente.telefono_contacto" placeholder="Ej: 3564 123456" />
          </div>
        </div>
      </div>

      <!-- SELECTOR DE TIPO DE EVENTO -->
      <div class="select-container">
        <label for="service-select">Selecciona el tipo de evento a cotizar:</label>
        <select v-model="selectedOption" id="service-select" class="select">
          <option value="fifteen">Fiestas de 15 Años / Cumpleaños / Aniversarios</option>
          <option value="wedding">Bodas</option>
          <option value="prom">Egresados</option>
          <option value="other">Personalizado</option>
        </select>
      </div>

      <div class="form-container">
        <!-- Inyectamos la config global a los hijos -->
        <component 
          :is="selectedComponent" 
          :isAdminLoggedIn="isAdminLoggedIn" 
          :config="configGlobal" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Swal from 'sweetalert2';
import { obtenerConfigUsuario, guardarConfigUsuario } from '@/services/presupuestoService';

import FifteenBudgetDetail from '@/components/FifteenBudgetDetail.vue';
import WeddingBudgetDetail from '@/components/WeddingBudgetDetail.vue';
import PromBudgetDetail from '@/components/PromBudgetDetail.vue';
import OtherBudgetDetail from '@/components/OtherBudget.vue';

const logoImage = new URL('https://dl.dropboxusercontent.com/scl/fi/88du6azdw0ra19avnk31l/mt.jpg?rlkey=aqiids5q04l4fmymp0j4bjhru&st=avkk9osm', import.meta.url).href;
const backgroundImage = new URL('https://dl.dropboxusercontent.com/scl/fi/xlzcgnnmjinncvex5f524/background.jpg?rlkey=kctu2redkuelqy2wlspz0aliv&st=kl8bpsjc', import.meta.url).href;

const selectedOption = ref('fifteen');
const isAdminLoggedIn = ref(false);
const guardando = ref(false);

// ESTADO GLOBAL DE PRECIOS Y PERFIL
const configGlobal = ref({
  precioBase: 170000,
  costoHoraExtra: 50000,
  inflacionAnual: 37,
  costoKm: 250,
  nombre_empresa: 'MT Producciones',
  nombre_firmante: 'Mauricio Trossero',
  rubro_servicio: 'Fotografía y Video Profesional',
  logo_url: 'https://dl.dropboxusercontent.com/scl/fi/88du6azdw0ra19avnk31l/mt.jpg?rlkey=aqiids5q04l4fmymp0j4bjhru&st=avkk9osm',
  telefono: '(3564) 6074890'
});

// NUEVO: OBJETO EXACTO DE LA BD DE GESTIÓN
const datosCliente = ref({
  cliente_nombre: '',
  titulo_evento: '',
  telefono_contacto: '',
  descripcion: ''
});

const selectedComponent = computed(() => ({
  fifteen: FifteenBudgetDetail,
  wedding: WeddingBudgetDetail,
  prom: PromBudgetDetail,
  other: OtherBudgetDetail,
}[selectedOption.value] || null));

onMounted(() => {
  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {
    isAdminLoggedIn.value = !!user;
    if (user) {
      const configBD = await obtenerConfigUsuario(user.uid);
      if (configBD) {
        configGlobal.value = { ...configGlobal.value, ...configBD };
      }
    }
  });
});

const guardarPreciosEnBD = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  guardando.value = true;
  try {
    const configBD = await obtenerConfigUsuario(user.uid) || {};
    const nuevaConfig = { ...configBD, ...configGlobal.value };

    await guardarConfigUsuario(user.uid, nuevaConfig);
    Swal.fire({
      icon: 'success', title: 'Precios Globales Guardados', 
      text: 'Todos los presupuestos usarán ahora estos valores.', timer: 2000, showConfirmButton: false
    });
  } catch (error) {
    Swal.fire('Error', 'No se pudieron guardar los precios.', 'error');
  } finally {
    guardando.value = false;
  }
};
</script>

<style scoped>
.app-container { position: relative; min-height: 100vh; z-index: 0; overflow: hidden; padding-top: 20px; }
.logo-container { position: relative; z-index: 10; width: 100px; height: 100px; background-color: white; border-radius: 50%; overflow: hidden; margin: 20px auto; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
.background-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; filter: brightness(0.95); z-index: 0; }
.background-overlay::after { content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(255, 255, 255, 0.85); pointer-events: none; z-index: 1; }
.container { position: relative; z-index: 2; max-width: 800px; margin: 0 auto; padding: 20px; font-family: 'Inter', sans-serif; }
h1 { text-align: center; color: #1e293b; margin-bottom: 25px; font-weight: 800; font-size: 26px; }

.select-container { margin: 20px 0; background: white; border-radius: 10px; padding: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
.select-container label { display: block; margin-bottom: 8px; font-weight: bold; color: #475569; }
.select { width: 100%; padding: 12px; font-size: 15px; border: 1px solid #cbd5e1; border-radius: 6px; background-color: #f8fafc; color: #0f172a; cursor: pointer; outline: none; font-weight: 500; }
.select:focus { border-color: #2563eb; }
.form-container { margin-top: 20px; }
.logo-image { width: 100%; height: 100%; object-fit: cover; display: block; }

/* ESTILOS DEL PANEL ADMIN GLOBAL (Modo Claro) */
.admin-panel { 
  background: rgba(255, 255, 255, 0.95); 
  color: #333; 
  border-radius: 12px; 
  padding: 20px; 
  margin-bottom: 20px; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.05); 
  border: 1px solid #e2e8f0; 
}
.admin-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 15px; 
  flex-wrap: wrap; 
  gap: 10px; 
}
.admin-header h3 { 
  margin: 0; 
  font-size: 16px; 
  color: #1e293b; 
}
.btn-guardar-config { 
  background: #2563eb; 
  color: white; 
  border: none; 
  padding: 8px 15px; 
  border-radius: 6px; 
  cursor: pointer; 
  font-weight: bold; 
}
.btn-guardar-config:hover { 
  background: #1d4ed8; 
}
.inputs-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
  gap: 15px; 
}
.input-group label { 
  display: block; 
  font-size: 12px; 
  font-weight: bold; 
  color: #475569; 
  margin-bottom: 5px; 
}
.input-prefix { 
  display: flex; 
  align-items: center; 
  background: white; 
  border: 1px solid #cbd5e1; 
  border-radius: 6px; 
  overflow: hidden; 
}
.input-prefix span { 
  padding: 8px 12px; 
  background: #f1f5f9; 
  color: #475569; 
  font-weight: bold; 
  border-right: 1px solid #cbd5e1;
}
.input-prefix input { 
  border: none; 
  padding: 8px; 
  width: 100%; 
  outline: none; 
  background: white; 
  color: #333; 
}

@media screen and (max-width: 600px) {
  .container { padding: 10px; }
  .logo-container { width: 80px; height: 80px; }
  h1 { font-size: 1.5rem; }
}
</style>