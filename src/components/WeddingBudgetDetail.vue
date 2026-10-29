<template>
  <div class="presupuesto-card">
    <h2 class="titulo-calc">💍 Detalle de Cotización: Bodas</h2>

    <!-- SECCIÓN: FECHA Y DISTANCIA -->
    <div class="configuracion-evento">
      <div class="seccion-fecha">
        <label class="label-destacado">📅 Fecha del evento:</label>
        <DateSelected @updateMonthsRemaining="handleUpdateMonthsRemaining" />
        
        <div class="meses-box">
          <label>Meses restantes para el evento:</label>
          <input v-model.number="mesesProyectados" type="number" class="input-corto" />
        </div>
      </div>

      <div class="seccion-viaticos">
        <label class="label-destacado">🚗 Viáticos (Traslado)</label>
        <div class="viaticos-box">
          <label>Distancia Ida y Vuelta (KM):</label>
          <div class="input-prefix">
            <input v-model.number="kmDistancia" type="number" placeholder="Ej: 120" />
            <span class="suffix">KM</span>
          </div>
        </div>
        <p v-if="kmDistancia > 0" class="texto-costo">Costo de traslado: <strong>$ {{ formatearMoneda(costoViaticosTotal) }}</strong></p>
      </div>
    </div>

    <!-- SECCIÓN: ITEMS DEL SERVICIO ESPECÍFICOS DE BODAS -->
    <div class="seccion-items">
      <h3 class="label-destacado">📸 Selecciona los Servicios</h3>
      
      <div v-for="item in items" :key="item.value" class="item-fila" :class="{ 'seleccionado': selectedItems.includes(item.value) }">
        <div class="item-checkbox">
          <input type="checkbox" :id="item.value" :value="item.value" v-model="selectedItems" />
          <label :for="item.value">{{ item.label }}</label>
        </div>
        
        <div class="item-horas">
          <label :for="item.value + 'Horas'">Horas:</label>
          <input type="number" :id="item.value + 'Horas'" v-model.number="item.horasTrabajadas" :disabled="!selectedItems.includes(item.value)" class="input-corto" min="1"/>
        </div>

        <div class="item-subtotal">
          <span v-if="selectedItems.includes(item.value)">
            $ {{ formatearMoneda(calcularCostoItem(item)) }}
          </span>
          <span v-else class="inactivo">No incluido</span>
        </div>
      </div>
    </div>

    <!-- RESULTADOS FINALES -->
    <div class="resultados-panel">
      <div class="res-item">
        <span>Total Presupuesto Hoy:</span>
        <h2>$ {{ formatearMoneda(presupuestoTotal) }}</h2>
      </div>
      <div class="res-item destacado" v-if="mesesProyectados >= 1">
        <span>Precio Financiado ({{ mesesProyectados }} meses):</span>
        <h2>$ {{ formatearMoneda(precioFinanciado) }}</h2>
      </div>
    </div>

    <!-- COMPARTIR -->
    <div class="compartir-panel">
      <h4>Compartir Cotización</h4>
      <div class="botones-compartir">
        <button class="btn-share ws" @click="compartir('whatsapp')" title="WhatsApp">📱 WhatsApp</button>
        <button class="btn-share ig" @click="compartir('instagram')" title="Instagram">📸 Instagram</button>
        <button class="btn-share fb" @click="compartir('facebook')" title="Messenger">💬 Messenger</button>
        <button class="btn-share pdf" @click="descargarPresupuestoPDF">📥 Descargar PDF</button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps } from 'vue';
import DateSelected from './DateSelected.vue'; 
import { generarPdfPresupuestoUniversal } from '@/services/pdfService';

// Recibimos los precios globales que nos pasa BudgetView
const props = defineProps({
  isAdminLoggedIn: Boolean,
  config: {
    type: Object,
    required: true
  },
  datosCliente: {
    type: Object,
    default: () => ({})
  }
});

// Variables de cálculo
const mesesProyectados = ref(0);
const kmDistancia = ref(0);
const selectedItems = ref<string[]>([]);

// Ítems específicos para Bodas (basados en tu código original)
const items = ref([
  { label: 'Previa / Ceremonia Religiosa / Fiesta', value: 'fiesta', horasTrabajadas: 9 },
  { label: 'Sesión de fotos / Pre-Boda', value: 'preboda', horasTrabajadas: 2 },
  { label: 'Ceremonia Civil', value: 'civil', horasTrabajadas: 2 },
]);

// Cálculos usando props.config (la configuración global)
const costoViaticosTotal = computed(() => kmDistancia.value > 0 ? (kmDistancia.value * props.config.costoKm) : 0);

const calcularCostoBase = (horas: number): number => {
  if (horas === 2) return props.config.precioBase;
  if (horas > 2) return props.config.precioBase + ((horas - 2) * props.config.costoHoraExtra);
  if (horas === 1) return props.config.precioBase / 2;
  return 0;
};

const calcularCostoItem = (item: any): number => calcularCostoBase(item.horasTrabajadas);

const presupuestoTotal = computed(() => {
  const sumaItems = items.value
    .filter(item => selectedItems.value.includes(item.value))
    .reduce((total, item) => total + calcularCostoItem(item), 0);
  return sumaItems + costoViaticosTotal.value;
});

const precioFinanciado = computed(() => {
  const total = presupuestoTotal.value;
  if (total === 0) return 0;
  const inflacionMensual = props.config.inflacionAnual / 12 / 100;
  return total + (total * mesesProyectados.value * inflacionMensual);
});

// Helpers
const handleUpdateMonthsRemaining = (months: number) => mesesProyectados.value = months;
const formatearMoneda = (valor: number): string => new Intl.NumberFormat('es-AR').format(valor || 0);

const compartir = (red: string) => {
  const totalFormat = formatearMoneda(presupuestoTotal.value);
  const finanFormat = formatearMoneda(precioFinanciado.value);
  let texto = `¡Hola! Te comparto la cotización para tu Boda:\n\n*Total Hoy:* $${totalFormat}\n`;
  if (mesesProyectados.value >= 1) texto += `*Financiado (${mesesProyectados.value} meses):* $${finanFormat}\n`;
  const urlMensaje = encodeURIComponent(texto);
  
  if (red === 'whatsapp') window.open(`https://wa.me/?text=${urlMensaje}`, '_blank');
  if (red === 'instagram') window.open(`instagram://direct?text=${urlMensaje}`, '_blank');
  if (red === 'facebook') window.open(`fb-messenger://share?link=${encodeURIComponent(window.location.href)}&text=${urlMensaje}`, '_blank');
};
const descargarPresupuestoPDF = () => {
  const itemsFiltrados = items.value.filter(item => selectedItems.value.includes(item.value));

  // Si tipearon un título personalizado (Ej: "Los 15 de Angy"), lo usamos, si no, el genérico
  const tituloFinal = props.datosCliente?.titulo_evento || "Propuesta de Cobertura - Boda";

  generarPdfPresupuestoUniversal({
    tituloEvento: tituloFinal,
    clienteNombre: props.datosCliente?.cliente_nombre, // Le pasamos el cliente al PDF
    introTexto: "Sabemos que el matrimonio es un momento único e irrepetible. Presentamos esta propuesta de cobertura audiovisual para registrar cada emoción y detalle de su gran día.",
    itemsSeleccionados: itemsFiltrados,
    kmDistancia: kmDistancia.value,
    costoViaticos: costoViaticosTotal.value,
    presupuestoTotal: presupuestoTotal.value,
    mesesProyectados: mesesProyectados.value,
    precioFinanciado: precioFinanciado.value,
    perfilUsuario: props.config
  });
};

</script>

<style scoped>
/* Los mismos estilos limpios de la tarjeta moderna */
.presupuesto-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.08); font-family: 'Inter', sans-serif; color: #333; }
.titulo-calc { text-align: center; color: #1e293b; margin-bottom: 25px; font-size: 22px; }
.configuracion-evento { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 25px; }
.label-destacado { display: block; font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
.meses-box, .viaticos-box { margin-top: 15px; }
.meses-box label, .viaticos-box label { display: block; font-size: 13px; color: #475569; margin-bottom: 5px; }
.input-corto { width: 80px; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
.input-prefix { display: flex; align-items: center; background: white; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; width: max-content; }
.input-prefix .suffix { padding: 8px 10px; background: #e2e8f0; color: #475569; font-weight: bold; }
.input-prefix input { border: none; padding: 8px; width: 100px; outline: none; }
.texto-costo { font-size: 14px; color: #2563eb; margin-top: 5px; }
.seccion-items { margin-bottom: 30px; }
.item-fila { display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px; flex-wrap: wrap; gap: 10px; transition: all 0.2s; }
.item-fila.seleccionado { border-color: #2563eb; background: #eff6ff; }
.item-checkbox { flex: 2; min-width: 200px; display: flex; align-items: center; gap: 10px; font-weight: bold; }
.item-checkbox input { width: 18px; height: 18px; cursor: pointer; }
.item-horas { flex: 1; min-width: 100px; display: flex; align-items: center; gap: 10px; }
.item-subtotal { flex: 1; min-width: 100px; text-align: right; font-weight: bold; font-size: 16px; color: #0f172a; }
.inactivo { color: #94a3b8; font-weight: normal; font-size: 14px; }
.resultados-panel { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px; }
.res-item { background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #cbd5e1; }
.res-item span { display: block; font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
.res-item h2 { margin: 0; color: #1e293b; font-size: 24px; }
.res-item.destacado { background: #2563eb; color: white; border-color: #1d4ed8; }
.res-item.destacado span { color: #bfdbfe; }
.res-item.destacado h2 { color: white; }
.compartir-panel h4 { margin: 0 0 15px 0; text-align: center; color: #475569; }
.botones-compartir { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.btn-share { border: none; padding: 10px 15px; border-radius: 6px; color: white; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: opacity 0.2s; }
.btn-share:hover { opacity: 0.85; }
.btn-share.ws { background: #25D366; }
.btn-share.ig { background: #E1306C; }
.btn-share.fb { background: #0084FF; }
@media (max-width: 600px) { .item-fila { flex-direction: column; align-items: flex-start; } .item-subtotal { width: 100%; text-align: left; } }
</style>