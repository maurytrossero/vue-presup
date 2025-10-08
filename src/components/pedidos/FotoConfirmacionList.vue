<template>
  <div class="contenedor-pedidos">
    <h2 class="titulo-pedidos">Pedidos de Fotos de Comuniones 12/10/2025</h2>

    <!-- 🔒 Bloque mensaje masivo -->
    <div v-if="isAuthenticated" class="bloque-mensaje">
      <label for="mensaje" class="label-mensaje">Mensaje para enviar a todos:</label>
      <textarea
        id="mensaje"
        v-model="mensajeMasivo"
        class="textarea-mensaje"
        rows="4"
        placeholder="Escribí el mensaje que querés enviar a todos por WhatsApp..."
      ></textarea>
      <button @click="enviarMensajesMasivos" class="boton-masivo" type="button">
        Enviar mensaje a todos 📢
      </button>
    </div>

    <!-- 🔎 Buscador 
    <div class="buscador">
      <label for="busqueda" class="label-busqueda">Buscar pedido por nombre:</label>
      <input
        id="busqueda"
        v-model="busqueda"
        type="text"
        placeholder="Ingresá el nombre..."
        class="input-busqueda"
      />
    </div>-->

    <!-- 🧭 Bloque de filtros y búsqueda -->
    <div v-if="pedidos.length > 0" class="contenedor-filtros">
      <!-- Estado -->
      <div v-if="isAuthenticated" class="filtro-item">
        <label for="estado" class="label-filtro">Estado:</label>
        <select v-model="filtroEstado" id="estado" class="select-filtro">
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
        </select>
      </div>

      <!-- Buscar -->
      <div class="filtro-item">
        <label for="busqueda" class="label-filtro">Nombre:</label>
        <input
          id="busqueda"
          v-model="busqueda"
          type="text"
          placeholder="Ingresá el nombre..."
          class="input-filtro"
        />
      </div>

      <!-- WhatsApp -->
      <div v-if="isAuthenticated" class="filtro-item">
        <label for="whatsapp" class="label-filtro">WhatsApp:</label>
        <input
          id="whatsapp"
          v-model="filtroWhatsapp"
          type="text"
          placeholder="Ej: 3564..."
          class="input-filtro"
        />
      </div>

      <!-- Orden -->
      <div class="filtro-item">
        <label for="orden" class="label-filtro">Orden:</label>
        <select v-model="ordenSeleccionado" id="orden" class="select-filtro">
          <option value="nombreAsc">Nombre (A–Z)</option>
          <option value="fechaDesc">Más reciente</option>
          <option value="fechaAsc">Más antiguo</option>
        </select>
      </div>
    </div>


    <div v-if="loading" class="mensaje-cargando">Cargando pedidos...</div>
    <div v-else-if="pedidosFiltrados.length === 0" class="mensaje-vacio">
      No hay pedidos registrados.
    </div>

    <!-- 🧾 Listado de pedidos -->
    <div v-else class="lista-pedidos">
      <div
        v-for="(pedido, index) in pedidosFiltrados"
        :key="pedido.id"
        class="tarjeta-pedido"
      >
        <div class="info-pedido">
          <p><strong>#{{ index + 1 }}.</strong> <strong>Nombre:</strong> {{ pedido.nombre }}</p>

          <template v-if="isAuthenticated">
            <p>
              <strong>WhatsApp:</strong> {{ pedido.whatsapp }}
              <a
                href="#"
                @click.prevent="enviarMensajeIndividual(pedido)"
                class="link-whatsapp"
                title="Enviar mensaje con el texto redactado"
              >
                📲 Enviar mensaje
              </a>
            </p>
          </template>

          <p>
            <strong>Paquete:</strong> {{ pedido.paquete }} foto(s) oficiales + {{ pedido.fotosExtra }} extra(s)
          </p>
          <p><strong>Total:</strong> ${{ pedido.total }}</p>

          <div class="comprobantes-section" v-if="isAuthenticated">
            <p><strong>Comprobantes:</strong></p>
            <div v-if="pedido.comprobantes?.length > 0">
              <ul class="comprobantes-lista">
                <li v-for="c in pedido.comprobantes" :key="c.nombreArchivo">
                  <a :href="c.url" target="_blank" class="link-comprobante">{{ c.nombreArchivo }}</a>
                  <div class="comprobante-preview">
                    <img :src="c.url" alt="Comprobante" class="comprobante-img" />
                  </div>
                </li>
              </ul>
            </div>
            <p v-else>No cargados</p>
          </div>

          <p>
            <strong>Estado:</strong>
            <span :class="estadoColor(pedido.estado)">{{ pedido.estado }}</span>
          </p>
          <p class="fecha-pedido">
            Fecha: {{ pedido.createdAt?.toDate().toLocaleString() || 'sin fecha' }}
          </p>
        </div>

        <div class="acciones">
          <button
            v-if="pedido.estado === 'pendiente' && isAuthenticated"
            @click="aprobarPedido(pedido.id)"
            class="boton-aprobar"
            type="button"
          >
            Aprobar
          </button>

          <button
            v-if="isAuthenticated"
            @click="eliminarPedido(pedido.id)"
            class="boton-eliminar"
            type="button"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- 🔒 Totales -->
    <div v-if="pedidos.length > 0 && isAuthenticated" class="total-recaudado">
      💰 <strong>Total recaudado (según filtro):</strong> ${{ totalRecaudado }}
      <br />
      📦 <strong>Mostrando:</strong> {{ cantidadPedidos }} pedidos de {{ totalPedidos }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { aprobarEstadoPedido, escucharPedidos, eliminarPedidoPorId } from '@/services/fotoConfirmacionService';

const mensajeMasivo = ref('Hola, te confirmamos que recibimos tu pedido de fotos de confirmación. Muchas gracias 🙌');
const pedidos = ref<any[]>([]);
const loading = ref(true);
const filtroEstado = ref('');
const busqueda = ref('');
const filtroWhatsapp = ref('');
const ordenSeleccionado = ref('fechaDesc');

// ✅ Computed para autenticación
const isAuthenticated = computed(() => {
  return localStorage.getItem('token') !== null;
});

function estadoColor(estado: string) {
  return estado === 'aprobado' ? 'estado-aprobado' : 'estado-pendiente';
}

async function aprobarPedido(id: string) {
  const confirmar = confirm(
    '⚠️ ¿Confirmás que el pago fue acreditado correctamente?\n\nUna vez aprobado, el pedido se marcará como confirmado y será visible como aprobado.'
  );
  if (!confirmar) return;
  await aprobarEstadoPedido(id);
}


async function eliminarPedido(id: string) {
  if (confirm('¿Seguro que querés eliminar este pedido?')) {
    await eliminarPedidoPorId(id);
  }
}

// 🟢 Enviar mensaje individual (usa el texto del cuadro)
function enviarMensajeIndividual(pedido: any) {
  if (!mensajeMasivo.value.trim()) {
    alert('Primero escribí un mensaje en el cuadro superior.');
    return;
  }
  const telefono = (pedido.whatsapp || '').replace(/[^0-9]/g, '');
  if (!telefono) return;
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeMasivo.value)}`;
  window.open(url, '_blank');
}

// 🟢 Enviar mensajes a todos los pedidos filtrados
function enviarMensajesMasivos() {
  if (!mensajeMasivo.value.trim()) {
    alert('Primero escribí un mensaje para enviar.');
    return;
  }

  if (pedidosFiltrados.value.length === 0) {
    alert('No hay pedidos en la lista filtrada.');
    return;
  }

  if (!confirm(`¿Enviar este mensaje a ${pedidosFiltrados.value.length} pedidos visibles?`)) return;

  pedidosFiltrados.value.forEach((pedido, i) => {
    const telefono = (pedido.whatsapp || '').replace(/[^0-9]/g, '');
    if (telefono) {
      const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeMasivo.value)}`;
      // 🕐 Abrir con un pequeño retraso para evitar bloqueo de pop-ups
      setTimeout(() => window.open(url, '_blank'), i * 500);
    }
  });
}

// 🔹 Computed para filtros + búsqueda
const pedidosFiltrados = computed(() => {
  let lista = pedidos.value;

  // 🔸 Filtro por estado
  if (isAuthenticated.value && filtroEstado.value) {
    lista = lista.filter(p => p.estado === filtroEstado.value);
  }

  // 🔸 Filtro por nombre
  if (busqueda.value.trim()) {
    const texto = busqueda.value.toLowerCase();
    lista = lista.filter(p => p.nombre?.toLowerCase().includes(texto));
  }

  // 🔸 Filtro por WhatsApp (solo si logueado)
  if (isAuthenticated.value && filtroWhatsapp.value.trim()) {
    const tel = filtroWhatsapp.value.replace(/[^0-9]/g, '');
    lista = lista.filter(p => (p.whatsapp || '').replace(/[^0-9]/g, '').includes(tel));
  }

  // 🔸 Ordenamiento
  if (ordenSeleccionado.value === 'nombreAsc') {
    lista = [...lista].sort((a, b) => a.nombre?.localeCompare(b.nombre));
  } else if (ordenSeleccionado.value === 'fechaDesc') {
    lista = [...lista].sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  } else if (ordenSeleccionado.value === 'fechaAsc') {
    lista = [...lista].sort((a, b) => a.createdAt?.toMillis() - b.createdAt?.toMillis());
  }

  return lista;
});


// 🔹 Total recaudado dinámico según filtro
const totalRecaudado = computed(() => {
  return pedidosFiltrados.value.reduce((acc, p) => acc + (p.total || 0), 0);
});

const cantidadPedidos = computed(() => pedidosFiltrados.value.length);
const totalPedidos = computed(() => pedidos.value.length);

// 🔹 Suscripción en tiempo real
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  unsubscribe = escucharPedidos((data) => {
    pedidos.value = data;
    loading.value = false;
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});
</script>

<style scoped>
.contenedor-pedidos {
  max-width: 700px;
  margin: 2rem auto;
  padding: 1.5rem 2rem;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1f2937;
}

.titulo-pedidos {
  font-size: 2rem;
  font-weight: 700;
  color: #2563eb;
  text-align: center;
  margin-bottom: 2rem;
  letter-spacing: 0.03em;
}

.mensaje-cargando,
.mensaje-vacio {
  font-size: 1.25rem;
  font-weight: 500;
  color: #6b7280;
  text-align: center;
  padding: 2rem 0;
}

.lista-pedidos {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tarjeta-pedido {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem 1.75rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: box-shadow 0.3s ease;
}

.tarjeta-pedido:hover {
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.25);
}

@media (min-width: 640px) {
  .tarjeta-pedido {
    flex-direction: row;
    align-items: center;
  }
}

.info-pedido {
  flex: 1;
  line-height: 1.5;
}

.info-pedido p {
  margin: 0.3rem 0;
  font-size: 1rem;
}

.link-comprobante {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.link-comprobante:hover {
  text-decoration: underline;
}

.estado-aprobado {
  color: #16a34a; /* verde */
  font-weight: 700;
  text-transform: capitalize;
}

.estado-pendiente {
  color: #ca8a04; /* amarillo */
  font-weight: 700;
  text-transform: capitalize;
}

.fecha-pedido {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.6rem;
  font-style: italic;
}

.acciones {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-start;
}

@media (min-width: 640px) {
  .acciones {
    margin-top: 0;
    margin-left: 1.5rem;
  }
}

.boton-aprobar {
  background-color: #2563eb;
  color: white;
  padding: 0.55rem 1.2rem;
  font-size: 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.boton-aprobar:hover {
  background-color: #1d4ed8;
  box-shadow: 0 6px 14px rgba(29, 78, 216, 0.6);
}
.link-whatsapp {
  margin-left: 0.5rem;
  font-size: 0.9rem;
  color: #25d366; /* verde WhatsApp */
  text-decoration: none;
  font-weight: 600;
  vertical-align: middle;
  transition: color 0.2s ease;
}

.link-whatsapp:hover {
  color: #128c7e;
  text-decoration: underline;
}
.bloque-mensaje {
  margin: 1rem auto 1rem;
  max-width: 700px;
  display: flex;
  flex-direction: column;
}

.label-mensaje {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.textarea-mensaje {
  display: block;              /* asegura que respete los márgenes */
  margin: 0 auto;              /* centra horizontalmente */
  width: 80%;                  /* opcional: un poco más angosto para estética */
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  background-color: #f9fafb;
  color: #111827;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s ease;
}

.textarea-mensaje:focus {
  outline: none;
  border-color: #2563eb;
  background-color: #fff;
}

.boton-masivo {
  background-color: #10b981; /* verde */
  color: white;
  padding: 0.6rem 1.4rem;
  font-size: 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  margin: 1rem auto 2rem;
  display: block;
}

.boton-masivo:hover {
  background-color: #059669;
  box-shadow: 0 6px 14px rgba(5, 150, 105, 0.5);
}

.comprobantes-section {
  margin-top: 0.5rem;
}

.comprobantes-lista {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
}

.comprobantes-lista li {
  margin-bottom: 0.8rem;
}

.comprobante-preview {
  margin-top: 5px;
}

.comprobante-img {
  max-width: 180px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.total-recaudado {
  font-size: 1.3rem;
  font-weight: 700;
  color: #16a34a;
  text-align: center;
  margin: 1rem 0 2rem;
}
.filtros {
  margin: 1rem 0 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.select-filtro {
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-size: 1rem;
}

.boton-eliminar {
  background-color: #dc2626; /* rojo */
  color: white;
  padding: 0.55rem 1.2rem;
  font-size: 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  margin-left: 0.6rem;
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.boton-eliminar:hover {
  background-color: #b91c1c;
  box-shadow: 0 6px 14px rgba(185, 28, 28, 0.6);
}
/* 🆕 Estilos buscador */
.buscador {
  margin: 1.5rem 0;
  text-align: center;
}

.label-busqueda {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.input-busqueda {
  width: 100%;
  max-width: 400px;
  padding: 0.6rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  background-color: #f9fafb;
  color: #111827;
  transition: border-color 0.2s ease;
}

.input-busqueda:focus {
  outline: none;
  border-color: #2563eb;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(37, 99, 235, 0.2);
}
.filtro-whatsapp,
.ordenar {
  margin: 0.5rem 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label-whatsapp,
.label-orden {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.input-whatsapp,
.select-orden {
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.input-whatsapp:focus,
.select-orden:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 2px 5px rgba(37, 99, 235, 0.2);
}
/* 🧭 Contenedor general de filtros */
.contenedor-filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  justify-content: space-between;
  margin: 1.5rem 0 2rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Cada ítem del filtro */
.filtro-item {
  display: flex;
  flex-direction: column;
  flex: 1 1 150px;
  min-width: 140px;
}

/* Etiquetas */
.label-filtro {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #1f2937;
}

/* Campos */
.input-filtro,
.select-filtro {
  padding: 0.5rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-filtro:focus,
.select-filtro:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 2px 5px rgba(37, 99, 235, 0.25);
}

/* 🖥️ Desktop: todos los filtros en una sola fila */
@media (min-width: 640px) {
  .contenedor-filtros {
    flex-wrap: nowrap;
  }
  .filtro-item {
    flex: 1;
  }
}

/* 📱 Mobile: filtros apilados */
@media (max-width: 639px) {
  .contenedor-filtros {
    flex-direction: column;
    align-items: stretch;
  }
  .filtro-item {
    width: 100%;
  }
}

</style>