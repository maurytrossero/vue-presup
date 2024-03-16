<template>
  <div class="app-container">
    <!-- Sección de Precio Base -->
    <div class="logo-container">
      <img src="../public/img/mt.jpg" alt="Logo" class="logo-image" />
    </div>


    <!-- Contenido de tu aplicación aquí -->  
    <div class="container">
    <h1>Producción de Foto  / Video Profesional</h1>

    <div class="select-container">
      <label for="service-select">Selecciona un Servicio:</label>
      <select v-model="selectedOption" id="service-select" class="select">
        <option value="fifteen">Producción de Video para Fiestas de 15</option>
        <option value="wedding">Producción de Video para Bodas</option>
        <option value="prom">Producción de Video para Egresados</option>
        <option value="other">Presupuesto Personalizado</option>
      </select>


      
    </div>




    <div class="form-container">
      <component :is="selectedOption === 'fifteen' ? FifteenBudgetDetail : 
                   selectedOption === 'wedding' ? WeddingBudgetDetail : 
                   selectedOption === 'prom' ? PromBudgetDetail : 
                   selectedOption === 'other' ? OtherBudgetDetail : null" />
    </div>
  </div>
  </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue';
import FifteenBudgetDetail from './components/FifteenBudgetDetail.vue';
import WeddingBudgetDetail from './components/WeddingBudgetDetail.vue';
import PromBudgetDetail from './components/PromBudgetDetail.vue';
import OtherBudgetDetail from './components/OtherBudget.vue'; // Importar el componente OtherBudget.vue

const selectedOption = ref('fifteen'); // Opción seleccionada por defecto

</script>


<style>
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
  margin-bottom: 20px;
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
  border: 2px solid #333;
  border-radius: 5px;
  background-color: #fff;
  color: #333;
  cursor: pointer;
}

.select option {
  background-color: #fff;
  color: #333;
}

.form-container {
  margin-top: 20px;
}

/* Estilos responsivos */
@media screen and (max-width: 600px) {
  .container {
    padding: 10px;
  }
}

.app-container {
  /* Establecer la imagen de fondo */
  background-image: url('../public/img/background.jpg');
  /* Establecer el tamaño y posición de la imagen de fondo */
  background-size: cover;
  background-position: center;
  /* Establecer la opacidad */
  opacity: 0.7; /* Ajusta el valor de 0 a 1 según la opacidad deseada */
}

/* Contenedor de la imagen */
.logo-container {
  width: 100px; /* Ajusta el tamaño del contenedor según tus necesidades */
  height: 100px; /* Ajusta el tamaño del contenedor según tus necesidades */
  background-color: white; /* Fondo blanco */
  border-radius: 50%; /* Esquinas redondeadas */
  overflow: hidden; /* Asegura que la imagen no sobresalga del contenedor redondeado */
  margin: 0 auto; /* Centra el contenedor horizontalmente */
}

.logo-image {
  width: 100%; /* Ajusta el ancho de la imagen según tus necesidades */
  height: auto;
  display: block;
}

</style>
