<template>
  <div class="gestion-container">
    <div class="panel-header-top">
      <h2>Panel de Gestión Financiera</h2>
      <button class="btn-config" @click="abrirConfiguracion">⚙️ Mi Perfil / Logo</button>
    </div>

    <!-- PANEL DE ESTADÍSTICAS -->
    <div class="estadisticas-panel">
      <div class="stat-card total">
        <p>Total Presupuestado</p>
        <h3 class="nowrap">$ {{ formatearMoneda(totalPresupuestado) }}</h3>
      </div>
      <div class="stat-card cobrado">
        <p>Total Cobrado</p>
        <h3 class="nowrap">$ {{ formatearMoneda(totalCobrado) }}</h3>
      </div>
      <div class="stat-card adeudado">
        <p>Total Adeudado</p>
        <h3 class="nowrap">$ {{ formatearMoneda(totalAdeudado) }}</h3>
      </div>
    </div>

    <!-- Formulario Independiente para Agendar -->
    <div class="form-agendar">
      <h3>➕ Nuevo Evento</h3>
      <div class="inputs-grid">
        <input v-model="nuevoEvento.cliente_nombre" placeholder="Cliente / Contacto (Ej: Leticia)" />
        <input v-model="nuevoEvento.titulo_evento" placeholder="Título del Evento (Ej: Egreso Promo 27)" />
        <input v-model="nuevoEvento.fecha_evento" type="date" title="Fecha del Evento" />
        <input v-model="nuevoEvento.telefono_contacto" placeholder="Teléfono" />
        
        <select v-model="nuevoEvento.tipo_servicio" title="Tipo de Evento">
          <option value="15 Años">15 Años</option>
          <option value="Boda">Boda</option>
          <option value="Fiesta de Egreso">Fiesta de Egreso</option>
          <option value="Cumpleaños">Cumpleaños</option>
          <option value="Aniversario">Aniversario</option>
          <option value="Institucional">Institucional</option>
          <option value="Otro">Otro</option>
        </select>

        <select v-model="nuevoEvento.tipo_cobertura" title="Tipo de Cobertura">
          <option value="Foto">Solo Fotografía</option>
          <option value="Video">Solo Video</option>
          <option value="Foto y Video">Foto y Video</option>
        </select>

        <input v-model.number="nuevoEvento.total_presupuesto" type="number" placeholder="Monto Total Acordado ($)" />
      </div>
      
      <!-- Campo de descripción / notas -->
      <textarea v-model="nuevoEvento.descripcion" placeholder="Información adicional, horarios, dirección o notas (Opcional)" class="input-descripcion"></textarea>

      <button class="btn-guardar" @click="guardarEvento">Agendar Evento</button>
    </div>

    <hr />

    <!-- BARRA DE BUSCADOR Y FILTROS -->
    <div class="filtros-container">
      <div class="search-box">
        <input v-model="busqueda" type="text" placeholder="🔍 Buscar por cliente, evento o teléfono..." />
      </div>
      <div class="filter-box">
        <label>Estado: </label>
        <select v-model="filtroEstado">
          <option value="Todos">Todos los Estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Señado">Señado</option>
          <option value="Saldado">Saldado</option>
        </select>
      </div>
    </div>

    <!-- Tabla de Seguimiento (Responsiva) -->
    <div class="tabla-responsive">
      <table v-if="eventosFiltrados.length > 0">
        <thead>
          <tr>
            <th>Cliente</th>
            <th class="col-titulo">Título del Evento</th>
            <th>Fecha</th>
            <th>Servicio</th>
            <th>Cobertura</th>
            <th>Total</th>
            <th>Cobrado</th>
            <th>Saldo</th>
            <th>Estado</th>
            <th class="th-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="evento in eventosFiltrados" :key="evento.id">
            <td data-label="Cliente">
              <strong>{{ evento.cliente_nombre }}</strong>
            </td>
            
            <!-- Columna mejorada de Título y Notas -->
            <td data-label="Título del Evento" class="col-titulo">
              <div class="titulo-destacado">{{ evento.titulo_evento || '- - -' }}</div>
              <button 
                v-if="evento.descripcion" 
                class="btn-ver-notas" 
                @click="verNotasEvento(evento.titulo_evento || evento.cliente_nombre, evento.descripcion)"
                title="Leer detalles completos"
              >
                📝 Ver Detalles
              </button>
            </td>

            <td data-label="Fecha" class="nowrap">{{ formatearFecha(evento.fecha_evento) }}</td>
            <td data-label="Servicio">{{ evento.tipo_servicio }}</td>
            <td data-label="Cobertura">{{ evento.tipo_cobertura }}</td>
            <td data-label="Total" class="nowrap">$ {{ formatearMoneda(evento.total_presupuesto) }}</td>
            <td data-label="Cobrado" class="nowrap" style="color: green; font-weight: bold;">$ {{ formatearMoneda(evento.senia_pagada) }}</td>
            <td data-label="Saldo" class="nowrap" :class="{'deuda': evento.saldo_pendiente > 0}">$ {{ formatearMoneda(evento.saldo_pendiente) }}</td>
            <td data-label="Estado">
              <span :class="['badge', evento.estado_pago.toLowerCase()]">{{ evento.estado_pago }}</span>
            </td>
            <td data-label="Acciones" class="acciones-celda">
              <button class="btn-pago" title="Registrar Entrega de Dinero" @click="abrirPago(evento)">+ Entrega</button>
              <button class="btn-historial" title="Ver Pagos y Recibos Emitidos" @click="abrirHistorial(evento)">📋 Pagos</button>
              <button class="btn-editar" title="Editar Datos del Evento" @click="abrirEdicionEvento(evento)">✏️ Editar</button>
              <button class="btn-eliminar" title="Eliminar Evento" @click="borrarEvento(evento.id, evento.titulo_evento || evento.cliente_nombre)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else style="text-align: center; margin-top: 20px; color: #777;">
        {{ eventos.length === 0 ? 'No hay eventos registrados aún.' : 'No se encontraron eventos con los filtros aplicados.' }}
      </p>
    </div>

    <!-- MODAL DE CONFIGURACIÓN / MI PERFIL -->
    <div v-if="modalConfigVisible" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>⚙️ Personalizar Mi Perfil y Recibos</h3>
          <button class="btn-cerrar-modal" @click="cerrarModales">✖</button>
        </div>
        <div class="form-editar">
          <label>Nombre Comercial / Marca</label>
          <input v-model="perfilUsuario.nombre_empresa" placeholder="Ej: MT Producciones" />
          
          <label>Nombre de la Firma (en el recibo)</label>
          <input v-model="perfilUsuario.nombre_firmante" placeholder="Ej: Mauricio Trossero" />

          <label>Rubro / Descripción del Servicio (en pie de recibo)</label>
          <input v-model="perfilUsuario.rubro_servicio" placeholder="Ej: Fotografía y Video Profesional" />

          <label>URL de tu Logo (Google Drive, Dropbox, o web)</label>
          <input v-model="perfilUsuario.logo_url" placeholder="Pega aquí el enlace de tu logo" />
          <small style="color: #666; display: block; margin-top: 3px;">
            Si es de Google Drive o Dropbox, se convertirá automáticamente para el PDF.
          </small>

          <div v-if="perfilUsuario.logo_url" class="vista-previa-logo">
            <p>Vista previa del logo:</p>
            <img :src="convertirUrlImagen(perfilUsuario.logo_url)" alt="Logo Preview" style="max-height: 70px; object-fit: contain; border: 1px dashed #ccc; padding: 5px; border-radius: 4px;" />
          </div>

          <div class="modal-actions-footer">
            <button class="btn-guardar" @click="guardarPerfil">Guardar Configuración</button>
            <button class="btn-cancelar" @click="cerrarModales">Cancelar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE HISTORIAL DE PAGOS Y RECIBOS -->
    <div v-if="modalHistorialVisible" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Entregas y Recibos: {{ eventoActivo?.titulo_evento || eventoActivo?.cliente_nombre }}</h3>
          <button class="btn-cerrar-modal" @click="cerrarModales">✖</button>
        </div>
        
        <div class="tabla-responsive">
          <table v-if="eventoActivo?.historial_pagos?.length > 0" class="tabla-historial">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Monto Abonado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(pago, index) in eventoActivo.historial_pagos" :key="index">
                <td data-label="Fecha y Hora">{{ pago.fecha }}</td>
                <td data-label="Monto Abonado" class="nowrap" style="color: green; font-weight: bold;">$ {{ formatearMoneda(pago.monto) }}</td>
                <td data-label="Acciones" class="acciones-modal">
                  <button class="btn-preview" title="Ver Recibo en Pestaña Nueva" @click="generarReciboPDF(pago, index, 'previsualizar')">👁️ Ver</button>
                  <button class="btn-pdf" title="Descargar PDF" @click="generarReciboPDF(pago, index, 'descargar')">📥 Descargar</button>
                  <button class="btn-editar" title="Modificar monto/fecha" @click="editarPago(index)">✏️</button>
                  <button class="btn-eliminar-pago" title="Eliminar este pago" @click="eliminarPago(index)">❌</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else style="text-align: center; padding: 15px;">No hay pagos registrados para este evento.</p>
        </div>
      </div>
    </div>

    <!-- MODAL DE EDICIÓN DE EVENTO -->
    <div v-if="modalEditarVisible" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Editar Evento</h3>
          <button class="btn-cerrar-modal" @click="cerrarModales">✖</button>
        </div>
        <div class="form-editar">
          <label>Cliente (Contacto)</label>
          <input v-model="eventoEdicion.cliente_nombre" />
          
          <label>Título del Evento</label>
          <input v-model="eventoEdicion.titulo_evento" />
          
          <label>Fecha del Evento</label>
          <input v-model="eventoEdicion.fecha_evento" type="date" />
          
          <label>Teléfono</label>
          <input v-model="eventoEdicion.telefono_contacto" />
          
          <label>Tipo de Evento</label>
          <select v-model="eventoEdicion.tipo_servicio">
            <option value="15 Años">15 Años</option>
            <option value="Boda">Boda</option>
            <option value="Fiesta de Egreso">Fiesta de Egreso</option>
            <option value="Cumpleaños">Cumpleaños</option>
            <option value="Aniversario">Aniversario</option>
            <option value="Institucional">Institucional</option>
            <option value="Otro">Otro</option>
          </select>
          
          <label>Cobertura</label>
          <select v-model="eventoEdicion.tipo_cobertura">
            <option value="Foto">Solo Fotografía</option>
            <option value="Video">Solo Video</option>
            <option value="Foto y Video">Foto y Video</option>
          </select>
          
          <label>Notas / Descripción (Opcional)</label>
          <textarea v-model="eventoEdicion.descripcion" placeholder="Detalles extra del evento..."></textarea>

          <label>Total Presupuesto ($)</label>
          <input v-model.number="eventoEdicion.total_presupuesto" type="number" />
          
          <div class="modal-actions-footer">
            <button class="btn-guardar" @click="guardarEdicionEvento">Guardar Cambios</button>
            <button class="btn-cancelar" @click="cerrarModales">Cancelar</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  guardarPresupuestoAdmin, 
  obtenerPresupuestosGestion, 
  actualizarSaldos, 
  eliminarEventoAdmin, 
  actualizarEventoAdmin,
  obtenerConfigUsuario,
  guardarConfigUsuario
} from '@/services/presupuestoService';

const eventos = ref<any[]>([]);

// Buscador y Filtro
const busqueda = ref('');
const filtroEstado = ref('Todos');

// Modales
const modalHistorialVisible = ref(false);
const modalEditarVisible = ref(false);
const modalConfigVisible = ref(false);

const eventoActivo = ref<any>(null);
const eventoEdicion = ref<any>({});

// Perfil predeterminado
const perfilUsuario = ref({
  nombre_empresa: 'MT Producciones',
  nombre_firmante: 'Mauricio Trossero',
  rubro_servicio: 'Fotografía y Video Profesional',
  logo_url: 'https://dl.dropboxusercontent.com/scl/fi/88du6azdw0ra19avnk31l/mt.jpg?rlkey=aqiids5q04l4fmymp0j4bjhru&st=avkk9osm'
});

// Estado inicial del nuevo evento con Título y Descripción
const nuevoEvento = ref({
  cliente_nombre: '',
  titulo_evento: '',
  fecha_evento: '',
  telefono_contacto: '',
  tipo_servicio: '15 Años',
  tipo_cobertura: 'Foto y Video',
  total_presupuesto: null as number | null,
  descripcion: ''
});

onMounted(() => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      cargarEventos();
      cargarPerfilUsuario();
    }
  });
});

const cargarEventos = async () => {
  try {
    eventos.value = await obtenerPresupuestosGestion();
  } catch (error) {
    console.error("Error cargando eventos:", error);
  }
};

// --- Carga perfil según usuario logueado ---
const cargarPerfilUsuario = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const configGuardada = await obtenerConfigUsuario(user.uid);
    if (configGuardada) {
      perfilUsuario.value = { ...perfilUsuario.value, ...configGuardada };
    } else if (user.email === 'mtproduccioneshd@gmail.com') {
      perfilUsuario.value = {
        nombre_empresa: 'MT Producciones',
        nombre_firmante: 'Mauricio Trossero',
        rubro_servicio: 'Fotografía y Video Profesional',
        logo_url: 'https://dl.dropboxusercontent.com/scl/fi/88du6azdw0ra19avnk31l/mt.jpg?rlkey=aqiids5q04l4fmymp0j4bjhru&st=avkk9osm'
      };
    } else {
      perfilUsuario.value = {
        nombre_empresa: user.displayName || 'Mi Estudio',
        nombre_firmante: user.displayName || 'El Administrador',
        rubro_servicio: 'Fotografía Profesional',
        logo_url: ''
      };
    }
  }
};

const abrirConfiguracion = () => {
  modalConfigVisible.value = true;
};

const guardarPerfil = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  try {
    await guardarConfigUsuario(user.uid, perfilUsuario.value);
    Swal.fire('Configuración Guardada', 'Tus datos y logo se usarán en los nuevos recibos.', 'success');
    modalConfigVisible.value = false;
  } catch (error) {
    Swal.fire('Error', 'No se pudieron guardar tus datos de perfil.', 'error');
  }
};

// --- HELPER PARA CONVERTIR ENLACES DE GOOGLE DRIVE O DROPBOX ---
const convertirUrlImagen = (url: string): string => {
  if (!url) return '';

  if (url.includes('drive.google.com') && url.includes('/file/d/')) {
    const partes = url.split('/file/d/');
    if (partes[1]) {
      const id = partes[1].split('/')[0];
      return `https://lh3.googleusercontent.com/d/${id}`;
    }
  }

  if (url.includes('dropbox.com')) {
    return url.replace('dl=0', 'raw=1');
  }

  return url;
};

// --- FUNCIONES DE FORMATO ARGENTINA ---
const formatearMoneda = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') return '0';
  const num = Number(val);
  return isNaN(num) ? '0' : new Intl.NumberFormat('es-AR').format(num);
};

const formatearFecha = (fechaStr: string): string => {
  if (!fechaStr) return '';
  if (fechaStr.includes('-')) {
    const partes = fechaStr.split('T')[0].split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
  }
  return fechaStr;
};

// --- EVENTOS FILTRADOS EN TIEMPO REAL ---
const eventosFiltrados = computed(() => {
  return eventos.value.filter(ev => {
    const term = busqueda.value.toLowerCase();
    const matchBusqueda = ev.cliente_nombre?.toLowerCase().includes(term) ||
                          ev.titulo_evento?.toLowerCase().includes(term) ||
                          ev.telefono_contacto?.includes(term);
    const matchEstado = filtroEstado.value === 'Todos' || ev.estado_pago === filtroEstado.value;
    return matchBusqueda && matchEstado;
  });
});

// --- ESTADÍSTICAS CALCULADAS ---
const totalAdeudado = computed(() => {
  return eventos.value.reduce((total, ev) => total + (Number(ev.saldo_pendiente) || 0), 0);
});
const totalCobrado = computed(() => {
  return eventos.value.reduce((total, ev) => total + (Number(ev.senia_pagada) || 0), 0);
});
const totalPresupuestado = computed(() => {
  return eventos.value.reduce((total, ev) => total + (Number(ev.total_presupuesto) || 0), 0);
});

// --- GESTIÓN DE EVENTOS ---
const guardarEvento = async () => {
  if (!nuevoEvento.value.cliente_nombre || !nuevoEvento.value.titulo_evento || !nuevoEvento.value.fecha_evento || !nuevoEvento.value.total_presupuesto) {
    return Swal.fire('Faltan datos', 'Cliente, Título, Fecha y Monto Total son obligatorios.', 'warning');
  }

  // ALERTA DE COINCIDENCIA DE FECHAS
  const fechaSeleccionada = nuevoEvento.value.fecha_evento;
  const eventoExistente = eventos.value.find(ev => ev.fecha_evento === fechaSeleccionada);

  if (eventoExistente) {
    const confirmar = await Swal.fire({
      title: '📅 Coincidencia de Fecha',
      html: `Ya tienes agendado el evento <b>${eventoExistente.titulo_evento || eventoExistente.cliente_nombre}</b> para este mismo día.<br><br>¿Deseas registrar este nuevo evento de todos modos (ej. para enviar un delegado)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, agendar igual',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f59e0b'
    });
    
    // Si el usuario cancela, detenemos la función
    if (!confirmar.isConfirmed) return;
  }

  const eventoParaGuardar = {
    ...nuevoEvento.value,
    senia_pagada: 0,
    saldo_pendiente: nuevoEvento.value.total_presupuesto,
    estado_pago: "Pendiente",
    historial_pagos: [] 
  };

  try {
    await guardarPresupuestoAdmin(eventoParaGuardar);
    Swal.fire('¡Agendado!', 'El evento se guardó correctamente.', 'success');
    
    // Limpiamos el formulario
    nuevoEvento.value = { 
      cliente_nombre: '', 
      titulo_evento: '',
      fecha_evento: '', 
      telefono_contacto: '', 
      tipo_servicio: '15 Años', 
      tipo_cobertura: 'Foto y Video', 
      total_presupuesto: null,
      descripcion: '' 
    };
    cargarEventos();
  } catch (error) {
    Swal.fire('Error', 'Hubo un problema al guardar.', 'error');
  }
};

const borrarEvento = async (id: string, nombre: string) => {
  const result = await Swal.fire({
    title: `¿Eliminar a ${nombre}?`,
    text: "Esta acción no se puede deshacer y borrará todo.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await eliminarEventoAdmin(id);
      Swal.fire('Eliminado', 'El evento ha sido borrado.', 'success');
      cargarEventos();
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar.', 'error');
    }
  }
};

const abrirEdicionEvento = (evento: any) => {
  eventoEdicion.value = { ...evento };
  modalEditarVisible.value = true;
};

const guardarEdicionEvento = async () => {
  try {
    let saldoNuevo = eventoEdicion.value.total_presupuesto - eventoEdicion.value.senia_pagada;
    let estadoNuevo = saldoNuevo <= 0 ? 'Saldado' : (eventoEdicion.value.senia_pagada > 0 ? 'Señado' : 'Pendiente');
    
    eventoEdicion.value.saldo_pendiente = saldoNuevo;
    eventoEdicion.value.estado_pago = estadoNuevo;

    await actualizarEventoAdmin(eventoEdicion.value.id, eventoEdicion.value);
    Swal.fire('Actualizado', 'Los datos del evento se actualizaron.', 'success');
    cerrarModales();
    cargarEventos();
  } catch (error) {
    Swal.fire('Error', 'No se pudo editar el evento.', 'error');
  }
};

// --- VISOR MODAL DE NOTAS COMPLETAS ---
const verNotasEvento = (titulo: string, descripcion: string) => {
  Swal.fire({
    title: `📝 Detalles del Evento`,
    html: `
      <div style="text-align: left;">
        <h4 style="color: #333; margin-bottom: 10px;">${titulo}</h4>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; white-space: pre-wrap; font-size: 14px; color: #475569;">${descripcion}</div>
      </div>
    `,
    confirmButtonText: 'Cerrar',
    confirmButtonColor: '#007bff'
  });
};


// --- GESTIÓN DE PAGOS ---
const abrirPago = async (evento: any) => {
  const { value: montoMandar } = await Swal.fire({
    title: 'Registrar Pago / Entrega',
    text: `Saldo actual: $ ${formatearMoneda(evento.saldo_pendiente)}`,
    input: 'number',
    inputPlaceholder: '¿Cuánto entrega hoy?',
    showCancelButton: true,
    confirmButtonText: 'Registrar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#28a745',
    inputValidator: (value) => {
      if (!value || Number(value) <= 0) return 'Ingresa un monto válido';
      if (Number(value) > evento.saldo_pendiente) return 'El monto supera el saldo pendiente';
    }
  });

  if (montoMandar) {
    const montoNuevo = parseFloat(montoMandar);
    const nuevoPago = {
      monto: montoNuevo,
      fecha: new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    };
    
    const historial = evento.historial_pagos ? [...evento.historial_pagos] : [];
    historial.push(nuevoPago);
    
    await procesarCambiosPago(evento, historial);
    Swal.fire('Pago Registrado', `Se descontaron $ ${formatearMoneda(montoNuevo)}.`, 'success');
    cargarEventos();
  }
};

const abrirHistorial = (evento: any) => {
  eventoActivo.value = { ...evento };
  modalHistorialVisible.value = true;
};

const cerrarModales = () => {
  modalHistorialVisible.value = false;
  modalEditarVisible.value = false;
  modalConfigVisible.value = false;
  eventoActivo.value = null;
  eventoEdicion.value = {};
  cargarEventos(); 
};

const eliminarPago = async (indexParam: any) => {
  const index = Number(indexParam);
  const result = await Swal.fire({
    title: '¿Eliminar este pago?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, Eliminar'
  });

  if (result.isConfirmed) {
    eventoActivo.value.historial_pagos.splice(index, 1);
    await procesarCambiosPago(eventoActivo.value, eventoActivo.value.historial_pagos);
    cargarEventos();
    Swal.fire('Eliminado', 'Pago borrado, saldos recalculados.', 'success');
  }
};

const editarPago = async (indexParam: any) => {
  const index = Number(indexParam);
  const pagoAntiguo = eventoActivo.value.historial_pagos[index];
  
  const { value: formValues } = await Swal.fire({
    title: 'Modificar Pago',
    html:
      `<label>Monto ($)</label><br><input id="swal-monto" class="swal2-input" type="number" value="${pagoAntiguo.monto}">` +
      `<br><br><label>Fecha y Hora</label><br><input id="swal-fecha" class="swal2-input" value="${pagoAntiguo.fecha}">`,
    focusConfirm: false,
    showCancelButton: true,
    preConfirm: () => {
      return {
        monto: parseFloat((document.getElementById('swal-monto') as HTMLInputElement).value),
        fecha: (document.getElementById('swal-fecha') as HTMLInputElement).value
      }
    }
  });

  if (formValues && formValues.monto > 0) {
    eventoActivo.value.historial_pagos[index] = formValues;
    await procesarCambiosPago(eventoActivo.value, eventoActivo.value.historial_pagos);
    cargarEventos();
    Swal.fire('Actualizado', 'Pago modificado correctamente.', 'success');
  }
};

const procesarCambiosPago = async (evento: any, nuevoHistorial: any[]) => {
  let totalPagado = 0;
  nuevoHistorial.forEach((p: any) => totalPagado += p.monto);
  
  const nuevoSaldo = evento.total_presupuesto - totalPagado;
  const nuevoEstado = nuevoSaldo <= 0 ? 'Saldado' : (totalPagado > 0 ? 'Señado' : 'Pendiente');

  await actualizarSaldos(evento.id, totalPagado, nuevoSaldo, nuevoEstado, nuevoHistorial);
  
  if (eventoActivo.value && eventoActivo.value.id === evento.id) {
    eventoActivo.value.senia_pagada = totalPagado;
    eventoActivo.value.saldo_pendiente = nuevoSaldo;
    eventoActivo.value.estado_pago = nuevoEstado;
    eventoActivo.value.historial_pagos = nuevoHistorial;
  }
};

// --- GENERADOR DE RECIBO PDF DINÁMICO ---
const generarReciboPDF = (pago: any, indexPago = 0, accion: 'descargar' | 'previsualizar' = 'descargar') => {
  const doc = new jsPDF();
  const evento = eventoActivo.value;
  const logoDirecto = convertirUrlImagen(perfilUsuario.value.logo_url);

  // Número de operación estructurado profesional: REC-FECHA-SECUENCIA (Ej: REC-28102026-01)
  const fechaDigits = (pago.fecha || '').replace(/[^0-9]/g, '').slice(0, 8);
  const numOperacion = `REC-${fechaDigits || '00000000'}-${(indexPago + 1).toString().padStart(2, '0')}`;

  if (logoDirecto) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = logoDirecto;

    img.onload = () => {
      doc.addImage(img, 'JPEG', 20, 15, 30, 30);
      completarPDF();
    };
    
    img.onerror = () => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(perfilUsuario.value.nombre_empresa, 20, 30); 
      completarPDF();
    };
  } else {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(perfilUsuario.value.nombre_empresa, 20, 30); 
    completarPDF();
  }

  function completarPDF() {
    // 1. Marca de agua
    doc.setTextColor(230, 230, 230);
    doc.setFontSize(60);
    doc.setFont("helvetica", "bold");
    doc.text("PAGADO", 105, 150, { angle: 25, align: "center" });

    // 2. Encabezados
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("RECIBO DE PAGO", 105, 35, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${pago.fecha}`, 145, 20);
    doc.text(`N° Operación: ${numOperacion}`, 145, 25);

    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(20, 50, 190, 50);

    // 3. Datos del Servicio
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Datos del Servicio", 20, 65);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Cliente: ${evento.cliente_nombre}`, 20, 75);
    doc.text(`Evento: ${evento.titulo_evento || 'No especificado'}`, 20, 83);
    doc.text(`Tipo de Servicio: ${evento.tipo_servicio} - ${evento.tipo_cobertura || 'No especificado'}`, 20, 91);
    doc.text(`Fecha del Evento: ${formatearFecha(evento.fecha_evento)}`, 20, 99);

    // 4. Caja de Montos
    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.rect(20, 110, 170, 45, 'S');

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 128, 0);
    doc.text(`Monto Abonado: $ ${formatearMoneda(pago.monto)}`, 25, 125);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(`Total del Presupuesto: $ ${formatearMoneda(evento.total_presupuesto)}`, 25, 137);
    doc.text(`Saldo Restante: $ ${formatearMoneda(evento.saldo_pendiente)}`, 25, 146);

    // 5. Firma Autogenerada Dinámica
    doc.setFont("times", "italic");
    doc.setFontSize(18);
    doc.setTextColor(30, 30, 80);
    doc.text(perfilUsuario.value.nombre_firmante || 'Firma Autorizada', 152.5, 218, { align: "center" });

    doc.setDrawColor(150);
    doc.setLineWidth(0.5);
    doc.line(120, 220, 185, 220);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Firma Autorizada", 152.5, 226, { align: "center" });
    doc.text(perfilUsuario.value.nombre_empresa, 152.5, 231, { align: "center" });

    // 6. Pie de página dinámico por profesional
    doc.setLineWidth(0.2);
    doc.line(20, 270, 190, 270);
    doc.setFontSize(9);
    doc.setTextColor(150);
    const rubroTexto = perfilUsuario.value.rubro_servicio || 'Servicios Audiovisuales';
    doc.text(`${perfilUsuario.value.nombre_empresa} - ${rubroTexto}`, 105, 278, { align: "center" });

    if (accion === 'previsualizar') {
      window.open(doc.output('bloburl'), '_blank');
    } else {
      const fechaLimpia = (pago.fecha || '').split(' ')[0].replaceAll('/', '-');
      const nombreArchivo = `Recibo_${(evento.titulo_evento || evento.cliente_nombre).replace(/\s+/g, '_')}_${fechaLimpia}.pdf`;
      doc.save(nombreArchivo);
    }
  }
};
</script>

<style scoped>
/* Estilos Base */
.gestion-container { background: #f8f9fa; padding: 20px; border-radius: 8px; max-width: 1350px; margin: 20px auto; color: #333; font-family: sans-serif; box-sizing: border-box; }
.nowrap { white-space: nowrap !important; }

.panel-header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
.btn-config { background: #6f42c1; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; }
.btn-config:hover { background: #5a32a3; }

/* Panel de Estadísticas */
.estadisticas-panel { display: flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap; }
.stat-card { flex: 1; min-width: 200px; padding: 15px; border-radius: 8px; color: white; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.stat-card p { margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; }
.stat-card h3 { margin: 5px 0 0 0; font-size: 26px; }
.total { background: #6c757d; }
.cobrado { background: #28a745; }
.adeudado { background: #dc3545; }

/* Formularios */
.form-agendar { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
.form-editar label { display: block; font-weight: bold; margin-top: 10px; font-size: 14px; }
.form-editar input, .form-editar select, .form-editar textarea { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; font-family: inherit; }
.form-editar textarea { resize: vertical; min-height: 80px; }
.inputs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin-bottom: 10px; }
.inputs-grid input, .inputs-grid select { padding: 10px; border: 1px solid #ccc; border-radius: 4px; width: 100%; box-sizing: border-box; }

.input-descripcion { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 15px; box-sizing: border-box; font-family: inherit; resize: vertical; min-height: 60px; }

.btn-guardar { width: 100%; background: #007bff; color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer; font-weight: bold; }
.btn-guardar:hover { background: #0056b3; }
.btn-cancelar { width: 100%; background: #6c757d; color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 8px; }
.btn-cancelar:hover { background: #5a6268; }

.modal-actions-footer { margin-top: 15px; display: flex; flex-direction: column; gap: 8px; }

hr { margin: 20px 0; border: 0; border-top: 1px solid #ddd; }

/* Buscador y Filtros */
.filtros-container { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 15px; flex-wrap: wrap; }
.search-box { flex: 2; min-width: 250px; }
.search-box input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; font-size: 14px; }
.filter-box { flex: 1; min-width: 180px; display: flex; align-items: center; gap: 8px; font-weight: bold; color: #555; }
.filter-box select { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; }

/* Tabla Principal y Layout Clásico (PC) */
.tabla-responsive { width: 100%; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size: 14px; }
th, td { border: 1px solid #eee; padding: 10px 12px; text-align: left; vertical-align: middle; }
th { background-color: #f1f1f1; font-weight: bold; color: #555; }
.th-acciones { text-align: center; }
.deuda { color: #dc3545; font-weight: bold; }

/* AJUSTES PARA LA COLUMNA DE TÍTULO Y DETALLES */
.col-titulo {
  min-width: 150px;
  max-width: 250px;
}
.titulo-destacado {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
  line-height: 1.3;
}
.btn-ver-notas {
  background-color: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
}
.btn-ver-notas:hover {
  background-color: #e2e8f0;
  color: #0f172a;
}

/* Badges de Estado */
.badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; color: white; display: inline-block; text-align: center; }
.badge.saldado { background-color: #28a745; }
.badge.señado { background-color: #ffc107; color: #333; }
.badge.pendiente { background-color: #dc3545; }

/* Celda de Acciones de la Tabla */
.acciones-celda { display: flex; gap: 4px; justify-content: center; align-items: center; width: max-content; }
.acciones-celda button { border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; transition: opacity 0.2s; white-space: nowrap; flex: 1; }
.acciones-celda button:hover { opacity: 0.85; }

.btn-pago { background: #28a745; color: white; }
.btn-historial { background: #17a2b8; color: white; }
.btn-editar { background: #ffc107; color: #222; }
.btn-eliminar { background: #dc3545; color: white; }

/* Modales */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 10px; box-sizing: border-box; }
.modal-content { background: white; padding: 20px; border-radius: 8px; width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.2); box-sizing: border-radius; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.modal-header h3 { margin: 0; color: #333; font-size: 18px; word-break: break-word; }
.btn-cerrar-modal { background: none; border: none; font-size: 20px; cursor: pointer; color: #888; }
.btn-cerrar-modal:hover { color: red; }

.vista-previa-logo { margin-top: 15px; text-align: center; background: #fafafa; padding: 10px; border-radius: 6px; }

/* Tabla Historial dentro del Modal */
.tabla-historial th { background: #f8f9fa; }
.acciones-modal { display: flex; gap: 5px; flex-wrap: wrap; }
.btn-preview { background: #17a2b8; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; }
.btn-pdf { background: #343a40; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; }
.btn-eliminar-pago { background: #dc3545; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; }

/* ====================================================
   DISEÑO RESPONSIVE "CARD LAYOUT" PARA MÓVILES (FIXED OVERFLOW)
   ==================================================== */
@media (max-width: 850px) {
  .gestion-container { padding: 12px 10px; border-radius: 0; }
  
  .tabla-responsive table, 
  .tabla-responsive tbody, 
  .tabla-responsive tr, 
  .tabla-responsive td {
    display: block;
    width: 100%;
    box-sizing: border-box;
  }

  .col-titulo {
    min-width: unset;
    max-width: unset;
  }

  .tabla-responsive thead {
    display: none; 
  }

  .tabla-responsive tr {
    margin-bottom: 15px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    border: 1px solid #ddd;
    overflow: hidden;
  }

  .tabla-responsive td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    text-align: right;
    padding: 10px 12px;
    font-size: 13px;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .tabla-responsive td:last-child {
    border-bottom: 0;
    background-color: #fcfcfc;
    padding: 12px;
  }

  .tabla-responsive td::before {
    content: attr(data-label);
    font-weight: bold;
    text-transform: uppercase;
    font-size: 11px;
    color: #666;
    text-align: left;
    margin-right: 10px;
    flex-shrink: 0;
    max-width: 45%;
  }

  .acciones-celda {
    min-width: 100% !important;
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
  }
  
  .acciones-modal {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    width: 100%;
  }
  
  .acciones-modal button {
    width: 100%;
    padding: 8px;
    font-size: 12px;
  }
}
</style>