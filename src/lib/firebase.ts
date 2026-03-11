import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9iqV0sQG0QhSVzR93drPU0ctlLEHmjJI",
  authDomain: "gamma-1-7b1d9.firebaseapp.com",
  projectId: "gamma-1-7b1d9",
  storageBucket: "gamma-1-7b1d9.firebasestorage.app",
  messagingSenderId: "234599104681",
  appId: "1:234599104681:web:c04f2262702ccf9eda69b8",
  measurementId: "G-TGMB9L41TM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
