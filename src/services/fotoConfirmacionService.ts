// src/services/fotoConfirmacionService.ts
import { db, storage } from '@/services/firebase';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';

export async function uploadComprobante(file: File): Promise<string> {
  const fileRef = storageRef(storage, `comprobantes/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}

export async function guardarPedido(data: any) {
  const pedidosRef = collection(db, 'fotoPedidos');
  await addDoc(pedidosRef, {
    ...data,
    createdAt: serverTimestamp(),
    comprobantes: [] // inicia vacío por si se agregan luego
  });
}

export async function getPedidos(): Promise<any[]> {
  const snapshot = await getDocs(collection(db, 'fotoPedidos'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function aprobarEstadoPedido(id: string): Promise<void> {
  const pedidoRef = doc(db, 'fotoPedidos', id);
  await updateDoc(pedidoRef, { estado: 'aprobado' });
}

/**
 * Busca el pedido por WhatsApp recorriendo todos los pedidos y comparando en JS.
 * Útil para diagnosticar problemas de formato o indexación en Firestore.
 */
export async function getPedidoPorWhatsapp(whatsapp: string) {
  const snapshot = await getDocs(collection(db, 'fotoPedidos'));
  const match = snapshot.docs.find(doc => {
    const data = doc.data();
    // Compara el WhatsApp con el ingresado, tal cual (puedes cambiar aquí para normalizar)
    return data.whatsapp === whatsapp;
  });
  return match ? { id: match.id, ...match.data() } : null;
}

export async function agregarComprobante(pedidoId: string, archivo: File) {
  const fileRef = storageRef(storage, `comprobantes/${pedidoId}/${archivo.name}`);
  await uploadBytes(fileRef, archivo);
  const url = await getDownloadURL(fileRef);

  const comprobante = {
    url,
    nombreArchivo: archivo.name,
    fecha: serverTimestamp()
  };

  const pedidoRef = doc(db, 'fotoPedidos', pedidoId);
  await updateDoc(pedidoRef, {
    comprobantes: arrayUnion(comprobante)
  });
}

export const actualizarPedido = async (
  pedidoId: string,
  datos: { paquete: number; fotosExtras: number }
) => {
  const docRef = doc(db, 'fotoPedidos', pedidoId);
  await updateDoc(docRef, {
    paquete: datos.paquete,
    fotosExtras: datos.fotosExtras,
  });
};
