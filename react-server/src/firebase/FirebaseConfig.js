// FirebaseConfig.js
import { getApps, initializeApp } from 'firebase/app';

// Assuming this object contains your firebaseConfig details.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase has already been initialized
const apps = getApps();
const app = apps.length ? apps[0] : initializeApp(firebaseConfig);

export default app;
