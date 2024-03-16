<template>
  <div class="app-container">
    <!-- Sección de Precio Base -->
    <div class="logo-container">
      <img src="../public/img/mt.jpg" alt="Logo" class="logo-image" />
    </div>
    <!-- Barra fija para el inicio de sesión -->
    <div class="fixed-login-bar">
          <LoginView @login="handleLogin" @logout="handleLogout"  />
        </div>


    <!-- Contenido de tu aplicación aquí -->  
    <div class="container">
    <h1>Producción de Foto  / Video Profesional</h1>

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
      <component :is="selectedOption === 'fifteen' ? FifteenBudgetDetail : 
                   selectedOption === 'wedding' ? WeddingBudgetDetail : 
                   selectedOption === 'prom' ? PromBudgetDetail : 
                   selectedOption === 'other' ? OtherBudgetDetail : null" 
                    :isAdminLoggedIn="isAdminLoggedIn"
                     @login="handleLogin"
                     @logout="handleLogout"
                   />
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref ,onMounted} from 'vue';
import FifteenBudgetDetail from './components/FifteenBudgetDetail.vue';
import WeddingBudgetDetail from './components/WeddingBudgetDetail.vue';
import PromBudgetDetail from './components/PromBudgetDetail.vue';
import OtherBudgetDetail from './components/OtherBudget.vue';
import LoginView from './views/LoginView.vue';

const selectedOption = ref('fifteen'); // Opción seleccionada por defecto


const isAdminLoggedIn = ref(localStorage.getItem('isAdminLoggedIn') === 'true'); // Estado para el admin


// Función para manejar el inicio de sesión
const handleLogin = (loggedIn: boolean) => {
  isAdminLoggedIn.value = loggedIn;
  localStorage.setItem('isAdminLoggedIn', loggedIn.toString()); // Guardar estado en el almacenamiento local
};

// Función para manejar el cierre de sesión
const handleLogout = () => {
  isAdminLoggedIn.value = false;
  localStorage.setItem('isAdminLoggedIn', 'false'); // Guardar estado en el almacenamiento local
};

// Actualizar isAdminLoggedIn al cargar el componente
onMounted(() => {
  if (localStorage.getItem('isAdminLoggedIn') === null) {
    localStorage.setItem('isAdminLoggedIn', 'false'); // Inicializar si no existe en el almacenamiento local
  }
});
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
  margin: 20px 0; /* Márgenes superior e inferior de 20px, y margen izquierdo y derecho automático */
  background-color: rgba(255, 255, 255, 0.9); /* Fondo blanco con 50% de transparencia */
  border-radius: 10px; /* Borde redondeado de 10px */
  padding: 10px; /* Espaciado interno de 10px */
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
  margin-top: 60px; /* Ajusta el margen superior para evitar que el logo se solape con la barra fija */

}

.logo-image {
  width: 100%; /* Ajusta el ancho de la imagen según tus necesidades */
  height: auto;
  display: block;
}

/* Estilos para la barra fija */
.fixed-login-bar {
  position: fixed; /* Fija la barra en la parte superior */
  top: 0; /* Coloca la barra en la parte superior */
  left: 0; /* Alinea la barra a la izquierda */
  width: 100%; /* Ocupa todo el ancho disponible */
  background-color: #ffffff; /* Color de fondo */
  padding: 10px; /* Añade espacio interno */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Sombra */
  z-index: 999; /* Asegura que esté por encima de otros elementos */
}

.main-content {
  margin-top: 60px; /* Ajusta el margen superior para evitar que el contenido se solape con la barra fija */
}

</style>
