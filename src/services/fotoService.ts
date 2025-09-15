// src/services/fotoService.ts
import { db } from '@/services/firebase';
import { collection, addDoc, getDocs, serverTimestamp, orderBy, query  } from 'firebase/firestore';

export interface FotoData {
  url: string;
  publicId: string;
  nombre: string;
  eventoId?: string; // opcional si querés asociarlo a un evento
  fecha?: any;
}
export interface FotoSubida {
  id: string;
  url: string;
  publicId: string;
  nombre: string;
  eventoId?: string;
}

export async function guardarFoto(data: FotoData) {
  try {
    const docRef = await addDoc(collection(db, 'fotosSubidas'), {
      ...data,
      fecha: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error guardando foto en Firestore:', error);
    throw error;
  }
}
export async function getFotosDisponibles(eventoId: string): Promise<FotoSubida[]> {
  const fotosRef = collection(db, 'fotosSubidas');
  const q = query(fotosRef, orderBy('nombre', 'asc')); // podés filtrar por eventoId si lo usás
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as FotoSubida[];
}