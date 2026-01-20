import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- PASTE YOUR CONFIG KEYS HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyCvJ04Miin0HuBgiVpGuR6rqvRhxFoVgeM",
  authDomain: "budgetbubble-902f1.firebaseapp.com",
  projectId: "budgetbubble-902f1",
  storageBucket: "budgetbubble-902f1.firebasestorage.app",
  messagingSenderId: "146773738906",
  appId: "1:146773738906:web:80f8648183bd6f01d7e623",
  measurementId: "G-YT2WCEXTWS"
};
// -----------------------------------

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);