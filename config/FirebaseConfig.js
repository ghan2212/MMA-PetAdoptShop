// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_PUBLISHABLE_KEY,
  authDomain: "pet-adopt-8803b.firebaseapp.com",
  projectId: "pet-adopt-8803b",
  storageBucket: "pet-adopt-8803b.firebasestorage.app",
  messagingSenderId: "40174908380",
  appId: "1:40174908380:web:9a6aa78b4b559646481519",
  measurementId: "G-PGVVT007Q4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
