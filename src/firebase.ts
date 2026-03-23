import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDenDGc-blnqQmv-yglNh6Y6q8tDnBFMG4",
  authDomain: "travelog-93bca.firebaseapp.com",
  projectId: "travelog-93bca",
  storageBucket: "travelog-93bca.firebasestorage.app",
  messagingSenderId: "778072352188",
  appId: "1:778072352188:web:30e50b1c733edcfa2c37b9",
  measurementId: "G-EZSEF8ZRHV",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);