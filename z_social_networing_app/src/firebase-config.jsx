// firebase-config.jsx
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOhBFnfjr_hqNxcRCL58ubmN641rxDVvY",
  authDomain: "z-social-web-app.firebaseapp.com",
  databaseURL: "https://z-social-web-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "z-social-web-app",
  storageBucket: "z-social-web-app.firebasestorage.app",
  messagingSenderId: "24296981614",
  appId: "1:24296981614:web:880cbb62636272374f127f",
  measurementId: "G-CRDEVEQZSE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const db = getFirestore(app);
const auth = getAuth(app);

// Export the auth object and any other Firebase services you need
export { db, auth };