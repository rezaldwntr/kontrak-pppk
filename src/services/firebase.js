import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBxG-jaiscNcJYJNSptLwB4ZrBx-Ai4w50",
    authDomain: "employee-contract-e78f5.firebaseapp.com",
    projectId: "employee-contract-e78f5",
    storageBucket: "employee-contract-e78f5.firebasestorage.app",
    messagingSenderId: "633360764521",
    appId: "1:633360764521:web:3807ed97fc273310181cf8",
    measurementId: "G-BPLKEXKTNR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
