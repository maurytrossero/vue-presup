import { jsPDF } from 'jspdf';
import Swal from 'sweetalert2';
import { getAuth } from 'firebase/auth';

interface ItemPresupuesto {
  label: string;
  horasTrabajadas: number;
}

interface DatosPresupuestoPDF {
  tituloEvento: string;
  introTexto: string;
  itemsSeleccionados: ItemPresupuesto[];
  kmDistancia: number;
  costoViaticos: number;
  presupuestoTotal: number;
  mesesProyectados: number;
  precioFinanciado: number;
  clienteNombre?: string; 
  fechaEvento?: string; 
  perfilUsuario: {
    nombre_empresa?: string;
    nombre_firmante?: string;
    rubro_servicio?: string;
    logo_url?: string;
    telefono?: string; 
  };
}

const formatearMoneda = (valor: number): string => {
  return new Intl.NumberFormat('es-AR').format(valor || 0);
};

// Redondear al múltiplo de 1000 más cercano para cifras más comerciales
const redondearAMil = (valor: number): number => {
  return Math.round(valor / 1000) * 1000;
};

const convertirUrlImagen = (url: string): string => {
  if (!url) return '';
  if (url.includes('drive.google.com') && url.includes('/file/d/')) {
    const partes = url.split('/file/d/');
    if (partes[1]) {
      const id = partes[1].split('/')[0];
      return `https://lh3.googleusercontent.com/d/${id}`;
    }
  }
  if (url.includes('dropbox.com')) return url.replace('dl=0', 'raw=1');
  return url;
};

export const generarPdfPresupuestoUniversal = (datos: DatosPresupuestoPDF) => {
  // Validación: Si el presupuesto es 0 o no hay ítems
  if (!datos.itemsSeleccionados || datos.itemsSeleccionados.length === 0 || datos.presupuestoTotal <= 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Presupuesto Vacío',
      text: 'Debes seleccionar al menos un servicio o ítem antes de descargar el presupuesto.',
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  const doc = new jsPDF();
  const perfil = datos.perfilUsuario || {};
  const logoDirecto = perfil.logo_url ? convertirUrlImagen(perfil.logo_url) : '';

  const auth = getAuth();
  const currentUser = auth.currentUser;
  let nombreFirmante: string = perfil.nombre_firmante || '';

  if (currentUser && currentUser.email === 'mtproduccioneshd@gmail.com') {
    nombreFirmante = 'Mauricio Trossero';
  } else if (!nombreFirmante) {
    nombreFirmante = 'Firma Autorizada';
  }

  const armarPDF = (imgCargada?: HTMLImageElement) => {
    // -------------------------------------------------------------------------
    // 1. ENCABEZADO Y LOGO
    // -------------------------------------------------------------------------
    const nombreEmpresa = perfil.nombre_empresa || "MT Audiovisuales";
    const rubroServicio = perfil.rubro_servicio || "Servicios Audiovisuales Profesionales";

    if (imgCargada) {
      doc.addImage(imgCargada, 'JPEG', 20, 12, 24, 24);
    }
    
    const xOffset = imgCargada ? 50 : 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text(nombreEmpresa, xOffset, 22);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(rubroServicio, xOffset, 27);
    
    // LÓGICA DINÁMICA DE CONTACTO: Solo imprime si existe el teléfono
    if (perfil.telefono && perfil.telefono.trim() !== '') {
      doc.text(`WhatsApp: ${perfil.telefono}`, xOffset, 32);
    }

    doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 190, 22, { align: 'right' });
    doc.text("Validez: 15 días", 190, 27, { align: 'right' });

    doc.setLineWidth(0.4);
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 40, 190, 40);

    // -------------------------------------------------------------------------
    // 2. TÍTULO Y PRESENTACIÓN
    // -------------------------------------------------------------------------
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(datos.tituloEvento.toUpperCase(), 20, 48);

    let yIntro = 55;

    // Si pasaron el nombre del cliente, le damos un toque súper personalizado
    if (datos.clienteNombre && datos.clienteNombre.trim() !== '') {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235); // Azul destacado
      doc.text(`Cliente: ${datos.clienteNombre}`, 20, yIntro);
      yIntro += 6;
    }

    // Fecha del Evento formateada (si fue seleccionada)
    if (datos.fechaEvento && datos.fechaEvento.trim() !== '') {
      // Convierte de YYYY-MM-DD a DD/MM/YYYY para que quede bien en Argentina
      const partes = datos.fechaEvento.split('-');
      const fechaFormateada = partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : datos.fechaEvento;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235); // Azul corporativo para destacar la fecha de la fiesta
      doc.text(`Fecha del Evento: ${fechaFormateada}`, 20, yIntro);
      yIntro += 6;
    } else {
      yIntro += 1;
    }
    
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(71, 85, 105);
    const lineasIntro = doc.splitTextToSize(datos.introTexto, 170);
    doc.text(lineasIntro, 20, yIntro);

    let y = yIntro + (lineasIntro.length * 5) + 8;

    // -------------------------------------------------------------------------
    // 3. TABLA DE ÍTEMS
    // -------------------------------------------------------------------------
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Detalle de Servicios Seleccionados", 20, y);
    y += 6;

    doc.setFillColor(241, 245, 249);
    doc.rect(20, y, 170, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("Servicio / Cobertura detallada", 25, y + 5.5);
    // Nota: Eliminamos el texto "Subtotal" para que no quede vacía esa columna
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    datos.itemsSeleccionados.forEach((item) => {
      doc.text(`• ${item.label} (${item.horasTrabajadas} hs de cobertura)`, 25, y);
      y += 8;
    });

    if (datos.kmDistancia > 0) {
      doc.text(`• Viáticos / Traslado (${datos.kmDistancia} KM ida y vuelta)`, 25, y);
      doc.text(`$ ${formatearMoneda(datos.costoViaticos)}`, 175, y, { align: 'right' });
      y += 8;
    }

    y += 4;
    doc.line(20, y, 190, y);
    y += 8;

    // -------------------------------------------------------------------------
    // 4. BLOQUE COMERCIAL DE CONDICIONES Y PAGOS (Con redondeo a miles)
    // -------------------------------------------------------------------------
    const tieneMeses = datos.mesesProyectados >= 1; 
    const altoCaja = tieneMeses ? 40 : 26;

    // Aplicamos redondeo a miles para la seña y el precio financiado
    const totalContado = redondearAMil(datos.presupuestoTotal);
    const senaCalculada = redondearAMil(totalContado * 0.25); 
    const financiadoCalculado = redondearAMil(datos.precioFinanciado);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(20, y, 170, altoCaja, 2, 2, 'FD');

    // Opción Contado (Siempre disponible y destacada)
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("• Precio de Contado (Pago total antes del evento):", 25, y + 8);
    doc.text(`$ ${formatearMoneda(totalContado)}`, 180, y + 8, { align: 'right' });

    if (tieneMeses) {
      // Opción Financiada
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("• Opción con Seña y Financiación:", 25, y + 17);
      
      doc.setFont("helvetica", "normal");
      doc.text(`  - Valor de Seña (25% para congelar tarifa):`, 25, y + 24);
      doc.text(`$ ${formatearMoneda(senaCalculada)}`, 180, y + 24, { align: 'right' });

      doc.setTextColor(37, 99, 235);
      doc.setFont("helvetica", "bold");
      doc.text(`  - Precio Financiado a ${datos.mesesProyectados} meses (hasta el evento):`, 25, y + 32);
      doc.text(`$ ${formatearMoneda(financiadoCalculado)}`, 180, y + 32, { align: 'right' });
    } else {
      // Evento inmediato
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(180, 83, 9);
      doc.text("  (Al ser un evento próximo, aplica únicamente el pago de contado antes de la fecha).", 25, y + 18);
    }

    y += altoCaja + 8;

    // -------------------------------------------------------------------------
    // 5. REGALO EXCLUSIVO (Solo MT Producciones, Texto sin emojis)
    // -------------------------------------------------------------------------
    const esMT = nombreEmpresa.toLowerCase().includes('mt producciones');
    if (esMT) {
      doc.setFillColor(254, 243, 199);
      doc.setDrawColor(252, 211, 77);
      doc.roundedRect(20, y, 170, 18, 2, 2, 'FD');

      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(180, 83, 9);
      // Texto limpio, sin el emoji que generaba el error de caracteres (Ø<ß•)
      doc.text("EXCLUSIVO: ¡De regalo con tu contratación!", 25, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(120, 53, 15);
      doc.text("Incluye Invitación Web Interactiva sin costo (cuenta regresiva, galería y confirmación de asistencia).", 25, y + 13);

      y += 24;
    }

    // -------------------------------------------------------------------------
    // 6. INFORMACIÓN Y RESERVAS (Textos cálidos)
    // -------------------------------------------------------------------------
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("Información útil y reservas:", 20, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.text("• Para reservar y asegurar la fecha de tu evento, lo coordinamos con el pago de la seña acordada.", 22, y);
    y += 4;
    doc.text("• Presupuesto válido por 15 días. Los traslados y detalles de catering se coordinan según la locación.", 22, y);

    // -------------------------------------------------------------------------
    // 7. FIRMA AUTOGENERADA (Fija en Y = 230)
    // -------------------------------------------------------------------------
    const posYFirma = 230;

    doc.setFont("times", "italic");
    doc.setFontSize(18);
    doc.setTextColor(30, 30, 80);
    doc.text(nombreFirmante, 152.5, posYFirma, { align: "center" });

    doc.setDrawColor(150);
    doc.setLineWidth(0.5);
    doc.line(120, posYFirma + 4, 185, posYFirma + 4);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Firma Autorizada", 152.5, posYFirma + 10, { align: "center" });
    doc.text(nombreEmpresa, 152.5, posYFirma + 15, { align: "center" });

    doc.save(`Presupuesto_${datos.tituloEvento.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (logoDirecto) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = logoDirecto;
    img.onload = () => armarPDF(img);
    img.onerror = () => armarPDF();
  } else {
    armarPDF();
  }
};