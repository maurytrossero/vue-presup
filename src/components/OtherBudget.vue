<template>
  <div class="presupuesto-container">
    
    <h1 class="titulo">Calculador de Presupuesto para Fiesta de 15</h1>

    <!-- Sección de Precio Base -->
    <div class="seccion-precio" v-if="isAdminLoggedIn">
      <label>Precio por 2 horas de cobertura </label>
      <input v-model="precioBase" type="number" />
    </div>

    <!-- Sección de Valor Hora Extra -->
    <div class="seccion-hora-extra" v-if="isAdminLoggedIn">
      <label>Precio por hora extra </label>
      <input v-model="costoHoraExtra" type="number" />
    </div>

    <!-- Sección de Meses de Proyección -->
    <div class="seccion-meses-proyeccion">
      <label for="service-select">Fecha del evento:</label>
      <DateSelected @updateMonthsRemaining="handleUpdateMonthsRemaining" />
      <br>
      <label>Cantidad de meses para el evento </label>
      <input v-model="mesesProyectados" type="number" />
    </div>

    <!-- Sección de Inflación Anual -->
    <div class="seccion-inflacion-anual" v-if="isAdminLoggedIn">
      <label>Inflación interanual %</label>
      <input v-model="inflacionAnual" type="number" /> 
    </div>

    <!-- Sección de Items -->
    <div class="seccion-items">
      <label class="subtitulo">Selecciona los Items</label>

      <!-- Contenedor de los items -->
      <div v-for="(item, index) in selectedItems" :key="index" class="item-container">
        <input
          type="checkbox"
          :id="item.value"
          :value="item.value"
          v-model="selectedItems[index].selected"
        />
        <label :for="item.value" class="item-label">{{ item.label }}</label>
        <input
          type="number"
          :id="item.value + 'Horas'"
          v-model="item.horasTrabajadas"
          :disabled="!item.selected"
          class="horas-input"
        />
        <label :for="item.value + 'Horas'" class="item-label">Horas Trabajadas </label>
        <p v-if="item.selected" class="costo-text">
          Costo {{ item.label }}: $ {{ calcularCostoItem(item) }}
        </p>

        <!-- Botón para quitar item -->
        <button @click="removeItem(index)" class="boton-quitar">Quitar</button>
      </div>

      <!-- Botón para agregar nuevo item -->
      <button @click="addItem" class="boton-agregar">Agregar Item</button>
    </div>


    <!-- Resultados -->
    <div class="resultados">
      <h2 class="subtitulo">Resultado del Presupuesto</h2>
      <p class="total-presupuesto">Total Presupuesto: $ {{ mostrarPresupuesto }}</p>
      <p v-if="mesesProyectados >= 1" class="precio-financiado">Precio Financiado {{ mesesProyectados }} meses: $ {{ mostrarPrecioFinanciado }}</p>
    </div>

    <!--Compartir presupuesto -->
    <div class="botones-container">
      <h3 class="compartir-titulo">Compartir Presupuesto</h3>

      <div class="botones-compartir">
        <button class="facebook-button" @click="compartirPorFacebookMessenger"></button>
        <button class="whatsapp-button" @click="compartirPorWhatsApp"></button>
        <button class="instagram-button" @click="compartirPorInstagram"></button>
        <button class="telegram-button" @click="compartirPorTelegram"></button>
        <button class="email-button" @click="compartirPorEmail"></button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DateSelected from './DateSelected.vue';

export default defineComponent({
  components: {
    DateSelected
  },
  props: {
    isAdminLoggedIn: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    console.log("El estado del admin es:", props.isAdminLoggedIn);
  },
  data() {
    return {
      precioBase: 110000,
        costoHoraExtra: 32000,
        mesesProyectados: 0,
        inflacionAnual: 66.9,
      selectedItems: [{ label: 'Item 1', value: 'item1', horasTrabajadas: 2, selected: false }],
      item1: { label: 'Item 1', value: 'item1', horasTrabajadas: 2 },
    };
  },
  
  methods: {
    calcularPresupuestoTotal(): number {
      return this.calcularCostoItem(this.item1);
    },
    calcularCostoItem(item: { label: string; value: string; horasTrabajadas: number }): number {
      const costoBase = this.calcularCostoBase(item.horasTrabajadas);
      return costoBase * this.calcularInflacionProyectada();
    },
    calcularCostoBase(horasTrabajadas: number): number {
      if (horasTrabajadas === 2) {
        return this.precioBase;
      } else if (horasTrabajadas > 2) {
        return this.precioBase + ((horasTrabajadas - 2) * this.costoHoraExtra);
      } else if (horasTrabajadas === 1) {
        return this.precioBase / 2;
      } else {
        return 0;
      }
    },
    calcularInflacionProyectada(): number {
      // Tu lógica de cálculo de inflación proyectada aquí
      return 1;
    },
    calcularPresupuesto(): number {
      return this.calcularCostoItem(this.item1);
    },
    calcularPrecioFinanciado(): string {
      const presupuesto = this.calcularPresupuesto();
      const inflacionMensual = this.inflacionAnual / 12 / 100;
      const resultado = presupuesto + presupuesto * this.mesesProyectados * inflacionMensual;

      if (resultado && typeof resultado === 'number') {
        return resultado.toFixed(2);
      } else {
        return '0.00';
      }
    },

    addItem() {
      const newItem = {
        label: `Item ${this.selectedItems.length + 1}`,
        value: `item${this.selectedItems.length + 1}`,
        horasTrabajadas: 2,
        selected: false
      };
      this.selectedItems.push(newItem);
    },
    removeItem(index: number) {
      this.selectedItems.splice(index, 1);
    },



    compartirPorWhatsApp() {
      const mensaje = encodeURIComponent("¡Hola! Te comparto el presupuesto calculado: Total Presupuesto: $" + this.mostrarPresupuesto + " Precio Financiado: $" + this.mostrarPrecioFinanciado);
      const url = "https://wa.me/?text=" + mensaje;
      window.open(url, '_blank');
    },
    compartirPorInstagram() {
      const mensaje = encodeURIComponent("¡Hola! Te comparto el presupuesto calculado: Total Presupuesto: $" + this.mostrarPresupuesto + " Precio Financiado: $" + this.mostrarPrecioFinanciado);
      const url = "instagram://direct?text=" + mensaje;
      window.open(url, '_blank');
    },
    compartirPorFacebookMessenger() {
      const mensaje = encodeURIComponent("¡Hola! Te comparto el presupuesto calculado: Total Presupuesto: $" + this.mostrarPresupuesto + " Precio Financiado: $" + this.mostrarPrecioFinanciado);
      const url = "fb-messenger://share?link=" + encodeURIComponent(window.location.href) + "&app_id=123456789&text=" + mensaje;
      window.open(url, '_blank');
    },
    compartirPorTelegram() {
      const mensaje = encodeURIComponent("¡Hola! Te comparto el presupuesto calculado: Total Presupuesto: $" + this.mostrarPresupuesto + " Precio Financiado: $" + this.mostrarPrecioFinanciado);
      const url = "https://t.me/share/url?url=&text=" + mensaje;
      window.open(url, '_blank');
    },
    compartirPorEmail() {
      const asunto = encodeURIComponent("Presupuesto Compartido");
      const cuerpo = encodeURIComponent("¡Hola! Te comparto el presupuesto calculado: Total Presupuesto: $" + this.mostrarPresupuesto + " Precio Financiado: $" + this.mostrarPrecioFinanciado);
      const url = "mailto:?subject=" + asunto + "&body=" + cuerpo;
      window.open(url, '_blank');
    },
    handleUpdateMonthsRemaining(...args: unknown[]): void {
      const monthsRemaining = args[0] as number;
      // Aquí puedes realizar cualquier lógica adicional, como validar el valor recibido
      // y luego actualizar el estado o realizar otras acciones según sea necesario.
      this.mesesProyectados = monthsRemaining;
    },
  },
  computed: {
    mostrarPresupuesto(): string {
      let totalPresupuesto = 0;
      this.selectedItems.forEach(item => {
        if (item.selected) {
          totalPresupuesto += this.calcularCostoItem(item);
        }
      });
      return totalPresupuesto.toFixed(2);
    },
    mostrarPrecioFinanciado(): string {
      const presupuesto = parseFloat(this.mostrarPresupuesto);
      const inflacionMensual = this.inflacionAnual / 12 / 100;
      const resultado = presupuesto + presupuesto * this.mesesProyectados * inflacionMensual;
      return resultado.toFixed(2);
    },
  },

});
</script>

 
  <style scoped>
  /* Estilos Generales */
  .presupuesto-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 10px;
    font-family: 'Arial', sans-serif;
    background-color: #f5f5f5;
    border-radius: 10px; /* Borde redondeado de 10px */

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
  
  .titulo {
    font-size: 20px;
    margin-bottom: 15px;
    color: #333;
  }
  
  /* Secciones */
  .seccion-precio,
  .seccion-hora-extra,
  .seccion-meses-proyeccion,
  .seccion-inflacion-anual,
  .seccion-items,
  .resultados {
    background-color: #fff;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 15px;
  }
  
  .subtitulo {
    font-size: 16px;
    margin-bottom: 10px;
    color: #555;
  }
  
  /* Elementos de Item */
  .item-container {
    flex-direction: column;
    margin-bottom: 10px;
  }
  
  .item-label,
  .horas-input,
  .costo-text {
    width: 100%;
    margin-right: 0;
  }
  
  .horas-input {
    width: 60px;
    margin-right: 10px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }
  
  .costo-text {
    font-size: 12px;
    color: #777;
    margin-top: 5px;
  }
  
  /* Resultados */
  .total-presupuesto,
  .precio-financiado {
    font-size: 16px;
    margin-bottom: 10px;
    color: #333;
  }
  
  /* Estilos para Inputs específicos */
  .seccion-precio input,
  .seccion-hora-extra input,
  .seccion-meses-proyeccion input,
  .seccion-inflacion-anual input {
    width: 100%;
    padding: 10px; /* Ajusta el padding según tus preferencias */
    margin-bottom: 10px; /* Espaciado inferior */
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 14px; /* Ajusta el tamaño de fuente según tus preferencias */
  }
  
  /* Ajustes para Dispositivos Móviles */
  @media screen and (max-width: 600px) {
    .seccion-precio input,
    .seccion-hora-extra input,
    .seccion-meses-proyeccion input,
    .seccion-inflacion-anual input {
      margin-bottom: 15px; /* Añade más espacio inferior en dispositivos móviles */
    }
  }
  
  /* Estilos para los botones de compartir */
  
  
  .botones-container {
    text-align: center; /* Centra los elementos */
  }
  
  .compartir-titulo {
    margin-bottom: 10px; /* Espacio inferior */
  }
  
  .botones-compartir {
    display: inline-block; /* Alinea los botones en línea */
  }
  
  .botones-compartir button {
    width: 50px; /* Ancho del botón */
    height: 50px; /* Altura del botón */
    margin: 0 10px; /* Espacio horizontal entre botones */
    display: inline-block;
    background-size: cover; /* Ajusta el tamaño de la imagen */
    background-repeat: no-repeat; /* Evita la repetición de la imagen */
    border: none; /* Elimina el borde del botón */
    border-radius: 50%; /* Forma redondeada */
    cursor: pointer; /* Cambia el cursor al pasar por encima */
    transition: background-color 0.3s; /* Transición para el efecto hover */
  }
  
  .botones-compartir button:hover {
    background-color: #ccc; /* Cambia el color al pasar el cursor por encima */
  }
  
  .facebook-button {
    background-image: url('https://e7.pngegg.com/pngimages/335/1001/png-clipart-social-media-facebook-computer-icons-social-network-linkedin-text-logo-internet.png');
  }
  
  .whatsapp-button {
    background-image: url('https://e7.pngegg.com/pngimages/347/373/png-clipart-computer-icons-whatsapp-whatsapp-text-trademark-thumbnail.png');
  }
  
  .instagram-button {
    background-image: url('https://e7.pngegg.com/pngimages/722/1011/png-clipart-logo-icon-instagram-logo-instagram-logo-purple-violet-thumbnail.png');
  }
  
  .telegram-button {
    background-image: url('https://e7.pngegg.com/pngimages/402/10/png-clipart-telegram-logo-scalable-graphics-icon-logo-blue-angle-thumbnail.png');
  }
  
  .email-button {
    background-image: url('https://e7.pngegg.com/pngimages/191/108/png-clipart-computer-icons-email-email-miscellaneous-blue-thumbnail.png');
  }
  
  /* Estilos para el botón de agregar ítem */
.botones-agregar button {
  padding: 10px 20px; /* Ajusta el padding según tus preferencias */
  background-color: #007bff; /* Color de fondo del botón */
  color: #fff; /* Color del texto del botón */
  border: none; /* Elimina el borde del botón */
  border-radius: 4px; /* Borde redondeado */
  cursor: pointer; /* Cambia el cursor al pasar por encima */
  transition: background-color 0.3s; /* Transición para el efecto hover */
}

.botones-agregar button:hover {
  background-color: #0056b3; /* Cambia el color al pasar el cursor por encima */
}

/* Estilos para el botón de quitar ítem */
.quitar-item {
  padding: 8px 16px; /* Ajusta el padding según tus preferencias */
  background-color: #dc3545; /* Color de fondo del botón */
  color: #fff; /* Color del texto del botón */
  border: none; /* Elimina el borde del botón */
  border-radius: 4px; /* Borde redondeado */
  cursor: pointer; /* Cambia el cursor al pasar por encima */
  transition: background-color 0.3s; /* Transición para el efecto hover */
}

.quitar-item:hover {
  background-color: #bd2130; /* Cambia el color al pasar el cursor por encima */
}
/* Estilos para el botón de agregar */
.boton-agregar {
  background-color: #4CAF50; /* Color de fondo verde */
  border: none; /* Sin borde */
  color: white; /* Color de texto blanco */
  padding: 10px 20px; /* Espaciado interno */
  text-align: center; /* Alineación de texto centrada */
  text-decoration: none; /* Sin decoración de texto */
  display: inline-block; /* Mostrar como bloque en línea */
  font-size: 16px; /* Tamaño de fuente */
  margin: 4px 2px; /* Margen exterior */
  cursor: pointer; /* Cursor tipo puntero al pasar */
  border-radius: 5px; /* Bordes redondeados */
}

/* Estilos para el botón de quitar */
.boton-quitar {
  background-color: #f44336; /* Color de fondo rojo */
  border: none; /* Sin borde */
  color: white; /* Color de texto blanco */
  padding: 10px 20px; /* Espaciado interno */
  text-align: center; /* Alineación de texto centrada */
  text-decoration: none; /* Sin decoración de texto */
  display: inline-block; /* Mostrar como bloque en línea */
  font-size: 16px; /* Tamaño de fuente */
  margin: 4px 2px; /* Margen exterior */
  cursor: pointer; /* Cursor tipo puntero al pasar */
  border-radius: 5px; /* Bordes redondeados */
}

  
  </style>
  