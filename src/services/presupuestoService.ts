import { db, auth } from './firebase';
import { collection, addDoc, getDoc, setDoc, getDocs, updateDoc, doc, query, where, orderBy, deleteDoc } from 'firebase/firestore';

const crmCollection = collection(db, "presupuestos_gestion");

export const guardarPresupuestoAdmin = async (datosCrm: any) => {
  try {
    const user = auth.currentUser;
    const userId = user ? user.uid : 'anonimo';

    const docRef = await addDoc(crmCollection, {
      ...datosCrm,
      userId: userId, // Asocia el evento al usuario logueado actual
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error al guardar presupuesto en gestión: ", error);
    throw error;
  }
};

export const obtenerPresupuestosGestion = async () => {
  try {
    const user = auth.currentUser;
    // Si el usuario aún no cargó en el auth, esperamos o usamos su UID real
    if (!user) return [];

    const q = query(crmCollection, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    
    const presupuestos: any[] = [];
    querySnapshot.forEach((doc) => {
      presupuestos.push({ id: doc.id, ...doc.data() });
    });

    // Ordenamos en memoria del navegador del más nuevo al más viejo
    return presupuestos.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    console.error("Error al obtener la lista de gestión: ", error);
    return [];
  }
};

export const actualizarSaldos = async (id: string, nuevaSenia: number, nuevoSaldo: number, estado: string, historial: any[]) => {
  try {
    const docRef = doc(db, "presupuestos_gestion", id);
    await updateDoc(docRef, {
      senia_pagada: nuevaSenia,
      saldo_pendiente: nuevoSaldo,
      estado_pago: estado,
      historial_pagos: historial,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error actualizando saldos: ", error);
    throw error;
  }
};

export const eliminarEventoAdmin = async (id: string) => {
  try {
    const docRef = doc(db, "presupuestos_gestion", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error al eliminar evento: ", error);
    throw error;
  }
};

export const actualizarEventoAdmin = async (id: string, datosActualizados: any) => {
  try {
    const docRef = doc(db, "presupuestos_gestion", id);
    await updateDoc(docRef, {
      ...datosActualizados,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error al actualizar evento: ", error);
    throw error;
  }
};

export const obtenerConfigUsuario = async (uid: string) => {
  try {
    const docRef = doc(db, "configuraciones_usuarios", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error obteniendo configuración del usuario:", error);
    return null;
  }
};

export const guardarConfigUsuario = async (uid: string, configData: any) => {
  try {
    const docRef = doc(db, "configuraciones_usuarios", uid);
    await setDoc(docRef, configData, { merge: true });
  } catch (error) {
    console.error("Error guardando configuración:", error);
    throw error;
  }
};