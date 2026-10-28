// src/services/eventoService.ts
import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';

export const guardarEvento = async (datosEvento: any) => {
  try {
    const docRef = await addDoc(collection(db, "eventos"), datosEvento);
    return docRef.id;
  } catch (e) {
    console.error("Error al guardar el evento: ", e);
    throw e;
  }
};

export const obtenerEventos = async () => {
  // Lógica para recuperar la lista de eventos agendados
};

export const registrarPago = async (idEvento: string, nuevoSaldo: number, nuevaSena: number) => {
  // Lógica para actualizar los saldos cuando el cliente te entrega dinero
};