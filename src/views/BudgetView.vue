<template>
  <div class="app-container">
    <div class="background-overlay" :style="{ backgroundImage: `url(${backgroundImage})` }"></div>

    <!-- Logo -->
    <div class="logo-container">
      <img :src="logoImage" alt="Logo MT Producciones" class="logo-image" />
    </div>

    <!-- SIEMPRE visible -->
    <div class="container">
      <h1>Producción de Foto / Video Profesional</h1>

      <div class="select-container">
        <label for="service-select">Selecciona un Servicio:</label>
        <select v-model="selectedOption" id="service-select" class="select">
          <option value="fifteen">Presupuesto para Fiestas de 15 Años / Cumpleaños / Aniversarios</option>
          <option value="wedding">Presupuesto para Bodas</option>
          <option value="prom">Presupuesto para Egresados</option>
          <option value="other">Presupuesto Personalizado</option>
        </select>
      </div>

      <div class="form-container">
        <!-- El componente recibe si el admin está logueado para mostrar/ocultar opciones de agendar -->
        <component :is="selectedComponent" :isAdminLoggedIn="isAdminLoggedIn" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Importamos Auth
import FifteenBudgetDetail from '@/components/FifteenBudgetDetail.vue';
import WeddingBudgetDetail from '@/components/WeddingBudgetDetail.vue';
import PromBudgetDetail from '@/components/PromBudgetDetail.vue';
import OtherBudgetDetail from '@/components/OtherBudget.vue';

const logoImage = new URL('https://dl.dropboxusercontent.com/scl/fi/88du6azdw0ra19avnk31l/mt.jpg?rlkey=aqiids5q04l4fmymp0j4bjhru&st=avkk9osm', import.meta.url).href;
const backgroundImage = new URL('https://dl.dropboxusercontent.com/scl/fi/xlzcgnnmjinncvex5f524/background.jpg?rlkey=kctu2redkuelqy2wlspz0aliv&st=kl8bpsjc', import.meta.url).href;

const selectedOption = ref('fifteen');
const isAdminLoggedIn = ref(false);

const selectedComponent = computed(() => ({
  fifteen: FifteenBudgetDetail,
  wedding: WeddingBudgetDetail,
  prom: PromBudgetDetail,
  other: OtherBudgetDetail,
}[selectedOption.value] || null));

// Verificamos la sesión real con Firebase en lugar de usar LocalStorage
onMounted(() => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    isAdminLoggedIn.value = !!user;
  });
});
</script>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
  z-index: 0;
  overflow: hidden;
  padding-top: 20px;
}

.logo-container {
  position: relative; 
  z-index: 10; 
  width: 100px;
  height: 100px;
  background-color: white;
  border-radius: 50%;
  overflow: hidden;
  margin: 20px auto 20px auto; /* Ajustado al quitar la barra superior fija de login */
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.background-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: brightness(0.95);
  z-index: 0;
}

.background-overlay::after {
  content: "";
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(255, 255, 255, 0.85); /* Un poco más opaco para mayor legibilidad */
  pointer-events: none;
  z-index: 1; 
}

.container {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
}

.select-container {
  margin: 20px 0;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.select-container label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #444;
}

.select {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  color: #333;
  cursor: pointer;
  outline: none;
}

.select:focus {
  border-color: #2563eb;
}

.form-container {
  margin-top: 20px;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@media screen and (max-width: 600px) {
  .container {
    padding: 10px;
  }
  .logo-container {
    width: 80px;
    height: 80px;
  }
  h1 {
    font-size: 1.5rem;
  }
}
</style>