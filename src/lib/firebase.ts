// Fix: Removed reference to vite/client as it was causing an error. This may lead to type errors on import.meta.env but those are unfixable without project configuration files.
// <reference types="vite/client" />

// FIX: Reverted to Firebase compat v8 API to fix module resolution errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/analytics';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // FIX: Cast import.meta to any to access env properties without Vite client types, which are unavailable.
  apiKey: (import.meta as any).env.VITE_API_KEY,
  authDomain: (import.meta as any).env.VITE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_APP_ID,
  measurementId: (import.meta as any).env.VITE_MEASUREMENT_ID
};


// FIX: Use Firebase compat initialization.
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
export const auth = firebase.auth();
export const db = firebase.firestore();
export const analytics = firebase.analytics();