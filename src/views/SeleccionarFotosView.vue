<template>
  <div class="editar-pedido-container">
    <h2 class="titulo">Seleccionar Fotos</h2>

    <!-- Mensaje de notificación -->
    <div v-if="mensaje" :class="['mensaje', tipoMensaje]">{{ mensaje }}</div>

    <!-- Buscar pedido -->
    <div class="form-group">
      <input
        v-model="whatsapp"
        placeholder="Ingresá tu número de WhatsApp registrado"
        class="input"
      />
      <button @click="buscarPedido" class="boton">Buscar</button>
    </div>

    <!-- Pedido encontrado -->
    <div v-if="pedido" class="pedido-card">
      <p><strong>Nombre:</strong> {{ pedido.nombre }}</p>
      <p><strong>Estado:</strong> {{ pedido.estado ?? 'pendiente' }}</p>
      <p><strong>Fotos permitidas:</strong> {{ maxFotos }}</p>
      <p><strong>Seleccionadas:</strong> {{ seleccionadas.length }} / {{ maxFotos }}</p>

      <!-- Mostrar aviso si el pedido no está aprobado -->
      <div v-if="pedido.estado !== 'aprobado'" class="mensaje info">
        Tu pedido está pendiente de pago 💳.
        Primero debés abonarlo para poder seleccionar tus fotos.
      </div>

      <!-- Bloquear galería si no está aprobado -->
      <template v-else>
        <!-- Fotos seleccionadas -->
        <div v-if="seleccionadas.length" class="seleccionadas">
          <h3>Fotos Seleccionadas</h3>
          <div class="separador"></div>
          <div class="seleccionadas-grid">
            <div
              v-for="url in seleccionadas"
              :key="url"
              class="foto-item-fija"
            >
              <img :src="url" class="foto-mini" />
              <!-- Lupa para ampliar la foto seleccionada -->
              <button class="btn-ampliar-peq" @click.stop="abrirAmpliadaPorUrl(url)" title="Ver en grande">🔍</button>
              <button class="boton eliminar" @click="eliminarSeleccion(url)" title="Quitar selección">✕</button>
            </div>
          </div>
        </div>

        <!-- Galería completa -->
        <div class="galeria-container">
          <h3>Elegí tus fotos de la galería para revelar</h3>
          <div class="separador"></div>
          <div class="galeria">
            <div
              v-for="(foto, index) in fotosDisponibles"
              :key="foto.url"
              class="foto-wrapper"
            >
              <!-- Clic simple = seleccionar/deseleccionar -->
              <img
                :src="foto.url"
                :alt="foto.nombre"
                class="foto-mini"
                @click="toggleSeleccion(foto.url)"
                :class="{ activa: seleccionadas.includes(foto.url) }"
              />
              <!-- Botón lupa para ampliar -->
              <button class="btn-ampliar" @click.stop="abrirAmpliada(index)" title="Ver en grande">🔍</button>
            </div>
          </div>
        </div>

        <button
          @click="guardarSeleccion"
          class="boton secundario"
          :disabled="seleccionadas.length === 0"
        >
          Guardar Selección
        </button>
      </template>
    </div>
    <!-- Modal ampliado con navegación -->
    <transition name="fade-zoom">
      <div
        v-if="fotoAmpliadaIndex !== null"
        class="modal"
        @click.self="cerrarAmpliada"
        role="dialog"
        aria-modal="true"
      >
        <button class="cerrar" @click="cerrarAmpliada" aria-label="Cerrar">✕</button>

        <button
          class="nav izquierda"
          @click.stop="anteriorFoto"
          :disabled="!tieneFotos"
          aria-label="Anterior"
        >⬅</button>

        <img
          v-if="tieneFotos && fotoAmpliadaIndex !== null"
          :src="fotosDisponibles[fotoAmpliadaIndex].url"
          :alt="fotosDisponibles[fotoAmpliadaIndex].nombre"
          class="foto-grande"
        />

        <button
          class="nav derecha"
          @click.stop="siguienteFoto"
          :disabled="!tieneFotos"
          aria-label="Siguiente"
        >➡</button>

        <button
          class="boton seleccionar"
          @click="toggleSeleccion(fotoActualUrl)"
        >
          {{ fotoActualUrl && seleccionadas.includes(fotoActualUrl) ? 'Quitar de selección' : 'Seleccionar esta foto' }}
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getPedidoPorWhatsapp, actualizarPedido } from '@/services/fotoConfirmacionService';
import { getFotosDisponibles } from '@/services/fotoService';

interface Pedido {
  id: string;
  nombre: string;
  paquete: number;
  fotosExtra: number;
  seleccionadas?: string[];
  estado?: string;
}

const whatsapp = ref('');
const pedido = ref<Pedido | null>(null);
const seleccionadas = ref<string[]>([]);
const fotosDisponibles = ref<{ url: string; nombre: string }[]>([]);

const mensaje = ref('');
const tipoMensaje = ref<'exito' | 'error' | 'info'>('exito');

// índice de la foto ampliada en fotosDisponibles (null = modal cerrado)
const fotoAmpliadaIndex = ref<number | null>(null);

// computed
const maxFotos = computed(() => {
  if (!pedido.value) return 0;
  return (pedido.value.paquete ?? 0) + (pedido.value.fotosExtra ?? 0);
});
const tieneFotos = computed(() => fotosDisponibles.value.length > 0);
const fotoActualUrl = computed(() => {
  return fotoAmpliadaIndex.value !== null ? fotosDisponibles.value[fotoAmpliadaIndex.value]?.url ?? null : null;
});

const mostrarMensaje = (texto: string, tipo: 'exito' | 'error' | 'info' = 'exito') => {
  mensaje.value = texto;
  tipoMensaje.value = tipo;
  setTimeout(() => (mensaje.value = ''), 4000);
};

const buscarPedido = async () => {
  const resultado = await getPedidoPorWhatsapp(whatsapp.value.trim());
  if (!resultado) {
    mostrarMensaje('Pedido no encontrado ❌', 'error');
    pedido.value = null;
    fotosDisponibles.value = [];
    seleccionadas.value = [];
    return;
  }

  pedido.value = resultado;
  seleccionadas.value = resultado.seleccionadas ?? [];
  fotosDisponibles.value = [];

  // Solo cargar fotos si el pedido está aprobado
  if (resultado.estado === 'aprobado') {
    const fotos = await getFotosDisponibles('evento123'); // reemplazar por evento real
    fotosDisponibles.value = fotos.map((f) => ({ url: f.url, nombre: f.nombre }));
  }
};

// seleccion / deselect
const toggleSeleccion = (url: string | null) => {
  if (!url) return;
  if (seleccionadas.value.includes(url)) {
    seleccionadas.value = seleccionadas.value.filter((f) => f !== url);
    return;
  }
  if (seleccionadas.value.length < maxFotos.value) {
    seleccionadas.value.push(url);
  } else {
    mostrarMensaje(`Solo podés elegir ${maxFotos.value} fotos`, 'error');
  }
};

const eliminarSeleccion = (url: string) => {
  seleccionadas.value = seleccionadas.value.filter((f) => f !== url);
};

const guardarSeleccion = async () => {
  if (!pedido.value) return;
  await actualizarPedido(pedido.value.id, {
    seleccionadas: seleccionadas.value,
  });
  mostrarMensaje('Selección guardada ✅', 'exito');
};

// abrir modal por índice
const abrirAmpliada = (index: number) => {
  if (index < 0 || index >= fotosDisponibles.value.length) return;
  fotoAmpliadaIndex.value = index;
};
// abrir modal por url (buscamos índice)
const abrirAmpliadaPorUrl = (url: string) => {
  const idx = fotosDisponibles.value.findIndex((f) => f.url === url);
  if (idx >= 0) fotoAmpliadaIndex.value = idx;
};
const cerrarAmpliada = () => {
  fotoAmpliadaIndex.value = null;
};

// navegación
const siguienteFoto = () => {
  if (fotoAmpliadaIndex.value === null || fotosDisponibles.value.length === 0) return;
  fotoAmpliadaIndex.value = (fotoAmpliadaIndex.value + 1) % fotosDisponibles.value.length;
};
const anteriorFoto = () => {
  if (fotoAmpliadaIndex.value === null || fotosDisponibles.value.length === 0) return;
  fotoAmpliadaIndex.value = (fotoAmpliadaIndex.value - 1 + fotosDisponibles.value.length) % fotosDisponibles.value.length;
};

// teclado: ESC para cerrar, flechas para navegar
const manejarTeclado = (e: KeyboardEvent) => {
  if (fotoAmpliadaIndex.value === null) return;
  if (e.key === 'Escape') cerrarAmpliada();
  if (e.key === 'ArrowRight') siguienteFoto();
  if (e.key === 'ArrowLeft') anteriorFoto();
};

onMounted(() => {
  window.addEventListener('keydown', manejarTeclado);
});
onUnmounted(() => {
  window.removeEventListener('keydown', manejarTeclado);
});
</script>

<style scoped>
* {
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

.editar-pedido-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.titulo {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.form-group {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}
.input {
  flex: 1;
  padding: 0.7rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  background-color: #f9fafb;
  color: #111827;
}
.boton {
  background-color: #4a90e2;
  color: white;
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
}
.boton:hover { background-color: #3b7bd5; }
.boton.secundario { background-color: #10b981; }
.boton.eliminar {
  background-color: #ef4444;
  padding: 0.2rem 0.4rem;
  font-size: 0.8rem;
  position: absolute;
  top: 6px;
  right: 40px;
  border-radius: 50%;
  color: white;
}

.pedido-card { background-color: #f9fafb; padding: 1.5rem; border-radius: 0.75rem; border: 1px solid #e5e7eb; margin-top: 1rem; color: #111827; }

.separador { height: 1px; background-color: #d1d5db; margin: 0.5rem 0 0.8rem 0; }

/* Galería */
.galeria {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.9rem;
}
.foto-wrapper { position: relative; }
.foto-mini {
  width: 100%;
  height: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.foto-mini:hover { transform: scale(1.03); box-shadow: 0 6px 18px rgba(0,0,0,0.18); }
.foto-mini.activa { outline: 3px solid #4a90e2; }

/* Botón lupa en miniatura */
.btn-ampliar {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0,0,0,0.6);
  border: none;
  color: white;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.btn-ampliar-peq {
  position: absolute;
  bottom: 6px;
  left: 6px;
  background: rgba(0,0,0,0.6);
  border: none;
  color: white;
  padding: 4px 6px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

/* Seleccionadas */
.seleccionadas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.6rem;
}
.foto-item-fija { position: relative; width: 100%; padding-top: 100%; }
.foto-item-fija img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }

/* Mensajes */
.mensaje { text-align: center; margin-bottom: 1rem; padding: 0.7rem; border-radius: 0.5rem; font-weight: 600; }
.mensaje.exito { background-color: #10b981; color: white; }
.mensaje.error { background-color: #ef4444; color: white; }
.mensaje.info { background-color: #f59e0b; color: white; }

/* Modal */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 1rem;
  flex-direction: column;
}
.foto-grande {
  max-width: 90%;
  max-height: 80%;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 8px 30px rgba(0,0,0,0.6);
  transition: transform 0.25s ease;
}
.cerrar {
  position: absolute;
  top: 18px;
  right: 18px;
  font-size: 26px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

/* Navegación modal */
.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 30px;
  background: rgba(255,255,255,0.06);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}
.nav.izquierda { left: 18px; }
.nav.derecha { right: 18px; }

/* Botón seleccionar dentro del modal */
.boton.seleccionar {
  margin-top: 8px;
  background-color: #4a90e2;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: none;
}

/* Transición fade + zoom para modal */
.fade-zoom-enter-active, .fade-zoom-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-zoom-enter-from, .fade-zoom-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
