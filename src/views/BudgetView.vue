<template>
    <div class="app-container">
      <div class="logo-container">
        <img src="https://dl.dropboxusercontent.com/scl/fi/88du6azdw0ra19avnk31l/mt.jpg?rlkey=aqiids5q04l4fmymp0j4bjhru&st=n7v85ipq" alt="Logo" class="logo-image" />
      </div>
  
      <div class="fixed-login-bar">
        <LoginView @login="handleLogin" @logout="handleLogout" />
      </div>
  
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
          <component :is="selectedComponent" :isAdminLoggedIn="isAdminLoggedIn" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import FifteenBudgetDetail from '../components/FifteenBudgetDetail.vue';
  import WeddingBudgetDetail from '../components/WeddingBudgetDetail.vue';
  import PromBudgetDetail from '../components/PromBudgetDetail.vue';
  import OtherBudgetDetail from '../components/OtherBudget.vue';
  import LoginView from '../views/LoginView.vue';
  
  const selectedOption = ref('fifteen');
  const isAdminLoggedIn = ref(false);
  
  const selectedComponent = computed(() => ({
    fifteen: FifteenBudgetDetail,
    wedding: WeddingBudgetDetail,
    prom: PromBudgetDetail,
    other: OtherBudgetDetail,
  }[selectedOption.value] || null));
  
  const handleLogin = (loggedIn) => {
    isAdminLoggedIn.value = loggedIn;
    localStorage.setItem('isAdminLoggedIn', loggedIn.toString());
  };
  
  const handleLogout = () => {
    isAdminLoggedIn.value = false;
    localStorage.setItem('isAdminLoggedIn', 'false');
  };
  
  onMounted(() => {
    isAdminLoggedIn.value = localStorage.getItem('isAdminLoggedIn') === 'true';
  });
  </script>
  
  <style>
  /* Fondo con opacidad solo en el background */
  .app-container {
    position: relative;
    background-image: url('https://dl.dropboxusercontent.com/scl/fi/xlzcgnnmjinncvex5f524/background.jpg?rlkey=kctu2redkuelqy2wlspz0aliv&st=na0j9h9g');
    background-size: cover;
    background-position: center;
  }
  
  .app-container::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.7);
    z-index: -1;
  }
  
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Arial', sans-serif;
  }
  
  h1 {
    text-align: center;
    color: #333;
  }
  
  .select-container {
    margin: 20px 0;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 10px;
    padding: 10px;
  }
  
  .select-container label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .select {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #333;
    border-radius: 5px;
    background-color: #fff;
    color: #333;
    cursor: pointer;
  }
  
  .form-container {
    margin-top: 20px;
  }
  
  .logo-container {
    width: 100px;
    height: 100px;
    background-color: white;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 auto;
    margin-top: 60px;
  }
  
  .logo-image {
    width: 100%;
    height: auto;
    display: block;
  }
  
  .fixed-login-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #ffffff;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 999;
  }
  </style>
  