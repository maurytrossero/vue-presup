// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC06DpolmMf5qFOIQAbKHubwL27Vyu2Eco",
  authDomain: "presupuestos-7f4e5.firebaseapp.com",
  projectId: "presupuestos-7f4e5",
  storageBucket: "presupuestos-7f4e5.appspot.com", // corregí aquí el dominio, era ".firebasestorage.app"
  messagingSenderId: "336804668867",
  appId: "1:336804668867:web:6bafe5da2ed5e019694976",
  // measurementId es opcional y solo para Analytics, no lo necesitas si no usas Analytics
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
