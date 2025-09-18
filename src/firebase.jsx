// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getStorage } from "firebase/storage"; // Import Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnJK-wIZQpXgrON757AM4gwkPRRPLi17Q",
  authDomain: "dentease-app.firebaseapp.com",
  projectId: "dentease-app",
  storageBucket: "dentease-app.appspot.com",
  messagingSenderId: "526321098823",
  appId: "1:526321098823:web:d8d7be6454995441a09162",
  measurementId: "G-WC4LPH21NW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore and Storage, then export them
export const db = getFirestore(app);
export const storage = getStorage(app);