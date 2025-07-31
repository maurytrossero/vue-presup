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

// src/types/Pedido.ts
export interface Pedido {
  id: string;
  nombre: string;
  paquete: number;
  fotosExtra: number;
  total: number;
  comprobantes: { url: string; nombreArchivo: string }[];
}

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
    comprobantes: []
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

export async function getPedidoPorWhatsapp(whatsapp: string): Promise<Pedido | null> {
  const snapshot = await getDocs(collection(db, 'fotoPedidos'));
  const match = snapshot.docs.find(doc => doc.data().whatsapp === whatsapp);
  if (!match) return null;

  const data = match.data();
  return {
    id: match.id,
    nombre: data.nombre ?? '',
    paquete: data.paquete ?? 1,
    fotosExtra: data.fotosExtra ?? 0,
    total: data.total ?? 0,
    comprobantes: data.comprobantes ?? [],
  };
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
  datos: { paquete: number; fotosExtra: number }
) => {
  const docRef = doc(db, 'fotoPedidos', pedidoId);
  await updateDoc(docRef, {
    paquete: datos.paquete,
    fotosExtra: datos.fotosExtra
  });
};
