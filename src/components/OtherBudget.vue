<template>
  <div class="presupuesto-card">
    <h2 class="titulo-calc">⚙️ Detalle de Cotización: Personalizado</h2>

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

    <!-- SECCIÓN: ITEMS PERSONALIZADOS Y EDITABLES -->
    <div class="seccion-items">
      <h3 class="label-destacado">📸 Ítems Personalizados</h3>
      
      <div v-for="(item, index) in selectedItems" :key="index" class="item-fila-personalizada" :class="{ 'seleccionado': item.selected }">
        <div class="item-main-grid">
          <div class="item-checkbox-label">
            <input type="checkbox" v-model="item.selected" :id="'chk-' + index" />
            <!-- Textbox editable para cambiar el nombre del detalle del ítem -->
            <input type="text" v-model="item.label" class="input-label-editable" placeholder="Nombre del servicio..." />
          </div>

          <div class="item-horas-box">
            <label>Horas:</label>
            <input type="number" v-model.number="item.horasTrabajadas" :disabled="!item.selected" class="input-corto" min="1" />
          </div>
        </div>

        <div class="item-footer-row">
          <p v-if="item.selected" class="costo-text">
            Costo {{ item.label || 'Servicio' }}: <strong>$ {{ formatearMoneda(calcularCostoItem(item)) }}</strong>
          </p>
          <span v-else class="inactivo">No incluido</span>

          <button @click="removeItem(index)" class="btn-quitar">🗑️ Quitar</button>
        </div>
      </div>

      <!-- Botón para agregar nuevo ítem -->
      <button @click="addItem" class="boton-agregar">➕ Agregar Nuevo Ítem</button>
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

// Recibimos la configuración global de precios desde BudgetView
const props = defineProps({
  isAdminLoggedIn: Boolean,
  config: {
    type: Object,
    required: true
  }
});

// Variables reactivas
const mesesProyectados = ref(0);
const kmDistancia = ref(0);

// Lista de ítems dinámicos con la propiedad 'label' totalmente editable
const selectedItems = ref([
  { label: 'Servicio Principal', value: 'item1', horasTrabajadas: 2, selected: true }
]);

// --- FUNCIONES DE CÁLCULO ---
const costoViaticosTotal = computed(() => kmDistancia.value > 0 ? (kmDistancia.value * props.config.costoKm) : 0);

const calcularCostoBase = (horas: number): number => {
  if (horas === 2) return props.config.precioBase;
  if (horas > 2) return props.config.precioBase + ((horas - 2) * props.config.costoHoraExtra);
  if (horas === 1) return props.config.precioBase / 2;
  return 0;
};

const calcularCostoItem = (item: any): number => calcularCostoBase(item.horasTrabajadas);

const presupuestoTotal = computed(() => {
  const sumaItems = selectedItems.value
    .filter(item => item.selected)
    .reduce((total, item) => total + calcularCostoItem(item), 0);
  return sumaItems + costoViaticosTotal.value;
});

const precioFinanciado = computed(() => {
  const total = presupuestoTotal.value;
  if (total === 0) return 0;
  const inflacionMensual = props.config.inflacionAnual / 12 / 100;
  return total + (total * mesesProyectados.value * inflacionMensual);
});

// --- GESTIÓN DE ÍTEMS ---
const addItem = () => {
  const nuevoIndex = selectedItems.value.length + 1;
  selectedItems.value.push({
    label: `Servicio ${nuevoIndex}`,
    value: `item${nuevoIndex}`,
    horasTrabajadas: 2,
    selected: false
  });
};

const removeItem = (index: number) => {
  selectedItems.value.splice(index, 1);
};

// --- HELPERS Y COMPARTIR ---
const handleUpdateMonthsRemaining = (months: number) => mesesProyectados.value = months;
const formatearMoneda = (valor: number): string => new Intl.NumberFormat('es-AR').format(valor || 0);

const compartir = (red: string) => {
  const totalFormat = formatearMoneda(presupuestoTotal.value);
  const finanFormat = formatearMoneda(precioFinanciado.value);
  let texto = `¡Hola! Te comparto la cotización personalizada:\n\n*Total Hoy:* $${totalFormat}\n`;
  if (mesesProyectados.value >= 1) texto += `*Financiado (${mesesProyectados.value} meses):* $${finanFormat}\n`;
  const urlMensaje = encodeURIComponent(texto);
  
  if (red === 'whatsapp') window.open(`https://wa.me/?text=${urlMensaje}`, '_blank');
  if (red === 'instagram') window.open(`instagram://direct?text=${urlMensaje}`, '_blank');
  if (red === 'facebook') window.open(`fb-messenger://share?link=${encodeURIComponent(window.location.href)}&text=${urlMensaje}`, '_blank');
};

const descargarPresupuestoPDF = () => {
  // Filtramos los ítems seleccionados y mapeamos sus etiquetas editadas
  const itemsFiltrados = selectedItems.value
    .filter(item => item.selected)
    .map(item => ({
      label: item.label || 'Servicio personalizado',
      horasTrabajadas: item.horasTrabajadas
    }));

  generarPdfPresupuestoUniversal({
    tituloEvento: "Propuesta de Cobertura - Personalizada",
    introTexto: "Presentamos la siguiente propuesta adaptada a la medida de los requerimientos solicitados para su evento.",
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

/* Estilos de Ítems Personalizados */
.seccion-items { margin-bottom: 30px; }
.item-fila-personalizada {
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 12px; transition: all 0.2s;
}
.item-fila-personalizada.seleccionado { border-color: #2563eb; background: #eff6ff; }
.item-main-grid { display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap; margin-bottom: 10px; }
.item-checkbox-label { display: flex; align-items: center; gap: 10px; flex: 2; min-width: 240px; }
.item-checkbox-label input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
.input-label-editable { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-weight: 500; outline: none; background: white; }
.input-label-editable:focus { border-color: #2563eb; }
.item-horas-box { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #475569; font-weight: bold; }
.item-footer-row { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; border-top: 1px dashed #e2e8f0; padding-top: 10px; }
.costo-text { font-size: 14px; color: #0f172a; margin: 0; }
.inactivo { color: #94a3b8; font-size: 14px; }

.btn-quitar { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px; }
.btn-quitar:hover { background: #fecaca; }

.boton-agregar { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 10px; }
.boton-agregar:hover { background: #059669; }

/* Resultados */
.resultados-panel { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px; }
.res-item { background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #cbd5e1; }
.res-item span { display: block; font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
.res-item h2 { margin: 0; color: #1e293b; font-size: 24px; }
.res-item.destacado { background: #2563eb; color: white; border-color: #1d4ed8; }
.res-item.destacado span { color: #bfdbfe; }
.res-item.destacado h2 { color: white; }

/* Botones Compartir */
.compartir-panel h4 { margin: 0 0 15px 0; text-align: center; color: #475569; }
.botones-compartir { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.btn-share { border: none; padding: 10px 15px; border-radius: 6px; color: white; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: opacity 0.2s; }
.btn-share:hover { opacity: 0.85; }
.btn-share.ws { background: #25D366; }
.btn-share.ig { background: #E1306C; }
.btn-share.fb { background: #0084FF; }

@media (max-width: 600px) {
  .item-main-grid { flex-direction: column; align-items: stretch; }
}
</style>