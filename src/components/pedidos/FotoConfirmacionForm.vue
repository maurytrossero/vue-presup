<template>
  <div class="formulario-container">
    <h2 class="titulo">Pedido de fotos para confirmaciones 2025</h2>

    <form @submit.prevent="handleSubmit" class="formulario">
      <!-- Nombre -->
      <div class="form-group">
        <label for="nombre">Nombre y apellido del niño/a</label>
        <input type="text" id="nombre" v-model="nombre" required />
      </div>

      <!-- WhatsApp -->
      <div class="form-group">
        <label for="whatsapp">WhatsApp del contacto, caracteristica sin el 0 y numero sin el 15</label>
        <input
          type="tel"
          id="whatsapp"
          v-model="whatsapp"
          required
          placeholder="Ej: 3511234567"
          pattern="[0-9]*"
          inputmode="numeric"
        />
      </div>

      <!-- Paquete de fotos -->
      <div class="form-group">
        <label for="paquete">Paquete de fotos</label>
        <select id="paquete" v-model.number="paquete" required>
          <option disabled value="">Seleccionar</option>
          <option :value="1">1 foto - $4000</option>
          <option :value="2">2 fotos - $8000</option>
          <option :value="3">3 fotos - $12000</option>
        </select>
      </div>

      <!-- Fotos extra -->
      <div class="form-group">
        <label for="extras">Fotos extra, seran tomadas despues de la misa en el altar</label>
        <input
          type="number"
          id="extras"
          v-model.number="extras"
          min="0"
          placeholder="Cantidad"
        />
      </div>

      <!-- Total calculado -->
      <div class="form-group total">
        <label>Total a pagar</label>
        <p class="total-pago">${{ total }}</p>
      </div>

      <!-- Alias -->
      <div class="form-group">
        <label>Transferencia a alias</label>
        <p class="alias">mauricio.mp.cor</p>
        <small class="alias-tip">
          Transferí el total a este alias y luego subí el comprobante.
        </small>
      </div>

    <!-- Comprobante -->
    <div class="form-group">
      <label for="comprobante">Comprobante de pago</label>
      <label class="custom-file-upload">
        <input type="file" @change="handleFileUpload" accept="image/*" />
        <span>📎 Seleccionar archivo</span>
      </label>
      <p v-if="comprobanteFile" class="archivo-cargado">
        Archivo: {{ comprobanteFile.name }}
      </p>
    </div>



      <!-- Botón -->
      <button type="submit" class="btn-enviar">Enviar pedido</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Swal from 'sweetalert2';
import { guardarPedido } from '@/services/fotoConfirmacionService';

const nombre = ref('');
const whatsapp = ref('');
const paquete = ref<number | ''>('');
const extras = ref(0);
const comprobanteFile = ref<File | null>(null);

const total = computed(() => {
  if (!paquete.value) return 0;
  return (paquete.value + extras.value) * 4000;
});

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files?.length) {
    comprobanteFile.value = target.files[0];
  }
};

const handleSubmit = async () => {
  if (!paquete.value) {
    Swal.fire('Seleccioná un paquete', '', 'warning');
    return;
  }

  if (!/^\d{10,15}$/.test(whatsapp.value.trim())) {
    Swal.fire('WhatsApp inválido', 'Ingresá un número válido sin espacios, caracteristica sin 0 y número sin 15.', 'warning');
    return;
  }

  try {
    await guardarPedido({
      nombre: nombre.value.trim(),
      whatsapp: whatsapp.value.trim(),
      paquete: paquete.value,
      fotosExtra: extras.value,
      total: total.value,
      comprobanteFile: comprobanteFile.value,
      estado: 'pendiente', 
    });

    Swal.fire({
      title: 'Pedido enviado 🎉',
      text: 'Tu pedido fue registrado correctamente.',
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });

    // Limpiar formulario
    nombre.value = '';
    whatsapp.value = '';
    paquete.value = '';
    extras.value = 0;
    comprobanteFile.value = null;
  } catch (error) {
    Swal.fire('Error', 'No se pudo guardar el pedido.', 'error');
    console.error('Error guardando pedido:', error);
  }
};

</script>

<style scoped>
/* Fuente base */
* {
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

/* Contenedor principal */
.formulario-container {
  max-width: 500px;
  margin: auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

/* Título */
.titulo {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

/* Estilo de formulario */
.formulario {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Etiquetas */
.form-group label {
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: #374151;
  font-size: 0.95rem;
}

/* Inputs y select */
input,
select {
  width: 100%;
  padding: 0.7rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  background-color: #f9fafb;
  color: #111827;
  transition: border 0.2s, box-shadow 0.2s;
}

input:focus,
select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

/* Alias */
.alias {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2563eb;
}

.alias-tip {
  font-size: 0.85rem;
  color: #6b7280;
}

/* Total */
.total-pago {
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
}

/* Archivo cargado */
.archivo-cargado {
  font-size: 0.9rem;
  color: #374151;
  margin-top: 0.3rem;
}

/* Botón */
.btn-enviar {
  background-color: #4a90e2;
  color: white;
  font-size: 1.1rem;
  padding: 0.9rem;
  border: none;
  border-radius: 0.6rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.btn-enviar:hover {
  background-color: #3b7ec4;
}

/* Custom file upload */
.custom-file-upload {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  color: white;
  background-color: #4a90e2;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
  text-align: center;
  font-size: 1rem;
}

.custom-file-upload:hover {
  background-color: #3b7ec4;
}

.custom-file-upload input[type="file"] {
  display: none;
}

.custom-file-upload span {
  color: white;
}

/* Responsive */
@media (max-width: 600px) {
  .formulario-container {
    padding: 1rem;
  }

  .titulo {
    font-size: 1.6rem;
  }

  .btn-enviar {
    font-size: 1rem;
    padding: 0.8rem;
  }
}
</style>

