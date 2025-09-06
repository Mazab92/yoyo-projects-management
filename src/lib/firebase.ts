// Fix: Removed reference to vite/client as it was causing an error. This may lead to type errors on import.meta.env but those are unfixable without project configuration files.
// <reference types="vite/client" />

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
// Fix: Use getFirestore from the v9 modular SDK instead of the compat version 'initializeFirestore'.
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
// Fix: Use getFirestore() for v9 modular API consistency. Removed deprecated settings.
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
