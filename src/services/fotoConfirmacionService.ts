import { db } from '@/services/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  query,
  where,
  limit,
  onSnapshot,
  orderBy,
  arrayRemove,
} from 'firebase/firestore';

// ---------------------------
// Tipos
// ---------------------------
export interface Comprobante {
  url: string;
  nombreArchivo: string;
}

export interface Pedido {
  id: string;
  nombre: string;
  whatsapp: string;
  paquete: number;
  fotosExtra: number;
  total: number;
  comprobantes: Comprobante[];
  estado?: string;
  createdAt?: any; // Firestore timestamp
}

// ---------------------------
// Subir archivo a Cloudinary
// ---------------------------
export async function uploadComprobanteToCloudinary(file: File): Promise<Comprobante> {
  const CLOUD_NAME = 'dgwdgpwzq';
  const UPLOAD_PRESET = 'unsigned_preset';

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(url, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Error al subir archivo a Cloudinary');

  const data = await res.json();
  return {
    url: data.secure_url,
    nombreArchivo: file.name
  };
}

// ---------------------------
// Crear pedido
// ---------------------------
// guardarPedido ya maneja comprobanteFile
export async function guardarPedido(
  data: Omit<Pedido, 'id' | 'comprobantes'> & { comprobanteFile?: File }
) {
  const { comprobanteFile, ...pedidoData } = data;
  const pedidosRef = collection(db, 'fotoPedidos');

  const docRef = await addDoc(pedidosRef, {
    ...pedidoData,
    estado: 'pendiente',
    comprobantes: [],
    createdAt: serverTimestamp()
  });

  if (comprobanteFile) {
    const comprobante = await uploadComprobanteToCloudinary(comprobanteFile);
    await updateDoc(docRef, { comprobantes: arrayUnion(comprobante) });
  }

  return docRef.id;
}


// ---------------------------
// Obtener todos los pedidos
// ---------------------------
export async function getPedidos() {
  const snapshot = await getDocs(collection(db, "fotoPedidos"));

  const pedidos = snapshot.docs.map(doc => {
    const data = doc.data();
    console.log("🔥 Pedido recuperado:", doc.id, data);
    return {
      id: doc.id,
      ...data,
    };
  });

  console.log("📦 Todos los pedidos:", pedidos);
  return pedidos;
}

// ---------------------------
// Obtener pedido por WhatsApp
// ---------------------------
export async function getPedidoPorWhatsapp(whatsapp: string): Promise<Pedido | null> {
  const q = query(collection(db, 'fotoPedidos'), where('whatsapp', '==', whatsapp), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Pedido;
}

// ---------------------------
// Agregar comprobante a un pedido existente
// ---------------------------
export async function agregarComprobante(pedidoId: string, archivo: File) {
  const comprobante = await uploadComprobanteToCloudinary(archivo);
  const pedidoRef = doc(db, 'fotoPedidos', pedidoId);

  await updateDoc(pedidoRef, {
    comprobantes: arrayUnion(comprobante),
  });
}

// ---------------------------
// Aprobar pedido
// ---------------------------
export async function aprobarEstadoPedido(id: string): Promise<void> {
  const pedidoRef = doc(db, 'fotoPedidos', id);
  await updateDoc(pedidoRef, { estado: 'aprobado' });
}

// ---------------------------
// Actualizar datos del pedido
// ---------------------------
interface ActualizarPedido {
  nombre?: string;
  paquete?: number;
  fotosExtra?: number;
  total?: number;
  comprobantes?: Comprobante[];
}

export async function actualizarPedido(id: string, data: ActualizarPedido) {
  const pedidoRef = doc(db, 'fotoPedidos', id);

  // Eliminar campos undefined
  const datosValidos: { [key: string]: any } = {};
  for (const key in data) {
    if (data[key as keyof ActualizarPedido] !== undefined) {
      datosValidos[key] = data[key as keyof ActualizarPedido];
    }
  }

  // Forzar tipo any para evitar error TS en producción
  if (Object.keys(datosValidos).length > 0) {
    await updateDoc(pedidoRef, datosValidos as any);
  }
}
export function escucharPedidos(callback: (pedidos: any[]) => void) {
  const pedidosRef = collection(db, "fotoPedidos");
  const q = query(pedidosRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const pedidos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(pedidos);
  });
}
export const eliminarComprobante = async (pedidoId: string, comprobante: any) => {
  await updateDoc(doc(db, 'fotoPedidos', pedidoId), {
    comprobantes: arrayRemove(comprobante),
  });
};