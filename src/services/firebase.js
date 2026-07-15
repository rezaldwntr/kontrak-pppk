import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCmgqRbRO5Tbxo_pJnHsJNQgnzeoxXeMw",
  authDomain: "employee-contract---preview.firebaseapp.com",
  projectId: "employee-contract---preview",
  storageBucket: "employee-contract---preview.firebasestorage.app",
  messagingSenderId: "669025973146",
  appId: "1:669025973146:web:ff44249ba4e6bbb8244023",
  measurementId: "G-HC426EZE5S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
