// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configurações do Firebase - pegue no Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyD2ONWmwHqSykFEAJY2BiyjHn7Gf2g5x8Y",
  authDomain: "app-donana.firebaseapp.com",
  projectId: "app-donana",
  storageBucket: "app-donana.firebasestorage.app",
  messagingSenderId: "194581449692",
  appId: "1:194581449692:web:a094a1df35babb5b8edd19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;