// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBu7DQ-SbO1iA5Bu3oMBnBULmQC9q2hbRI",
  authDomain: "comuniones-port.firebaseapp.com",
  projectId: "comuniones-port",
  storageBucket: "comuniones-port.firebasestorage.app",
  messagingSenderId: "943983826915",
  appId: "1:943983826915:web:4b28e75144c2877274f2d6"
  // measurementId es opcional y solo para Analytics, no lo necesitas si no usas Analytics
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);