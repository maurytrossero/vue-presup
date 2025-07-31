<template>
  <div class="editar-pedido-container">
    <h2 class="titulo">Editar Pedido</h2>

    <div class="form-group">
      <input v-model="whatsapp" placeholder="Ingresá tu WhatsApp" class="input" />
      <button @click="buscarPedido" class="boton">Buscar</button>
    </div>

    <div v-if="pedido" class="pedido-card">
      <p><strong>Nombre:</strong> {{ pedido.nombre }}</p>
      <p><strong>Paquete:</strong> {{ nuevoPaquete }}</p>

      <div class="form-group">
        <label>Paquete seleccionado</label>
        <select v-model="nuevoPaquete" class="input">
          <option value="1">Paquete 1 (1 foto)</option>
          <option value="2">Paquete 2 (2 fotos)</option>
          <option value="3">Paquete 3 (3 fotos)</option>
        </select>
      </div>

      <div class="form-group">
        <label>Fotos extra</label>
        <input type="number" min="0" v-model.number="nuevasExtras" class="input" />
      </div>

      <button @click="guardarCambios" class="boton secundario">Guardar Cambios</button>

      <p><strong>Total:</strong> ${{ pedido.total }}</p>

      <div class="form-group">
        <label>Agregar nuevo comprobante</label>
        <input type="file" @change="onFileChange" class="input-file" />
        <button @click="subirComprobante" class="boton secundario">Subir</button>
      </div>

      <h4>Comprobantes cargados:</h4>
      <ul class="comprobantes-lista">
        <li v-for="c in pedido.comprobantes" :key="c.nombreArchivo">
          <a :href="c.url" target="_blank">{{ c.nombreArchivo }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  getPedidoPorWhatsapp,
  agregarComprobante,
  actualizarPedido
} from '@/services/fotoConfirmacionService';

interface Pedido {
  id: string;
  nombre: string;
  paquete: number;
  fotosExtra: number;
  total: number;
  comprobantes: { url: string; nombreArchivo: string }[];
}

const whatsapp = ref('');
const pedido = ref<Pedido | null>(null);
const archivo = ref<File | null>(null);

const nuevoPaquete = ref<number>(1);
const nuevasExtras = ref<number>(0);

const safeNumber = (value: any, defaultValue = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && !isNaN(Number(value))) return Number(value);
  return defaultValue;
};

const buscarPedido = async () => {
  const resultado = await getPedidoPorWhatsapp(whatsapp.value.trim());
  console.log('resultado:', resultado);

  if (resultado) {
    pedido.value = {
      id: resultado.id,
      nombre: resultado.nombre ?? '',
      paquete: safeNumber(resultado.paquete, 1),
      fotosExtra: safeNumber(resultado.fotosExtra, 0),
      total: safeNumber(resultado.total, 0),
      comprobantes: resultado.comprobantes ?? []
    };

    nuevoPaquete.value = safeNumber(resultado.paquete, 1);
    nuevasExtras.value = safeNumber(resultado.fotosExtra, 0);
  } else {
    alert('Pedido no encontrado');
    pedido.value = null;
  }
};

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files?.length) archivo.value = input.files[0];
};

const subirComprobante = async () => {
  if (!archivo.value || !pedido.value) return;
  await agregarComprobante(pedido.value.id, archivo.value);
  alert('Comprobante agregado');
  buscarPedido();
};

const guardarCambios = async () => {
  if (!pedido.value) return;

  const paqueteToSave = Number(nuevoPaquete.value);
  const extrasToSave = Number(nuevasExtras.value);

  if (isNaN(paqueteToSave) || isNaN(extrasToSave)) {
    alert('Paquete o fotos extra inválidos');
    return;
  }

  await actualizarPedido(pedido.value.id, {
    paquete: paqueteToSave,
    fotosExtra: extrasToSave
  });

  alert('Datos actualizados');
  buscarPedido();
};
</script>



<style scoped>
.editar-pedido-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.titulo {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.input {
  padding: 0.6rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
}

.input:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.input-file {
  font-size: 0.95rem;
}

.boton {
  background-color: #4a90e2;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.boton:hover {
  background-color: #3b7bd5;
}

.boton.secundario {
  background-color: #10b981;
}

.boton.secundario:hover {
  background-color: #059669;
}

.pedido-card {
  background-color: #f9fafb;
  padding: 1.2rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.comprobantes-lista {
  margin-top: 1rem;
  padding-left: 1rem;
}

.comprobantes-lista li {
  margin-bottom: 0.5rem;
}
</style>
