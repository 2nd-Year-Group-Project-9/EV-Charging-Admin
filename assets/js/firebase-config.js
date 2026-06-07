import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSHV_DVBqojBF7RUDYLTfzP5K-XZxgEFs",
  authDomain: "plugme-admin.firebaseapp.com",
  projectId: "plugme-admin",
  storageBucket: "plugme-admin.firebasestorage.app",
  messagingSenderId: "728171164465",
  appId: "1:728171164465:web:443f9647926cb7bfffb610",
  measurementId: "G-PZ46PMZJPR"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
