import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCq0gxrmfaljo6j_BzEj7ABrmfwhhC4omo",
    authDomain: "task-sheet-webestone.firebaseapp.com",
    projectId: "task-sheet-webestone",
    storageBucket: "task-sheet-webestone.firebasestorage.app",
    messagingSenderId: "508848555962",
    appId: "1:508848555962:web:1a0cfd2220945c1c2ebf83"
};

// Initialize Firebase
// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage, firebaseConfig };

