// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getFirestore } from "firebase/firestore";

import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtt9iOi5eq_EzNLvLKZ3o_IoqQyS8j2tM",
  authDomain: "fitmonkey-c9b46.firebaseapp.com",
  projectId: "fitmonkey-c9b46",
  storageBucket: "fitmonkey-c9b46.firebasestorage.app",
  messagingSenderId: "439270934093",
  appId: "1:439270934093:web:603b3e017259c53a4bbe04"
};

// Initialize Firebase
//const app = initializeApp(firebaseConfig);

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore();
export const storage = getStorage(app);

export default app; 