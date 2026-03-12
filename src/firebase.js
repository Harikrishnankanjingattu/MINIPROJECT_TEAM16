
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBNjuPWI3lZGVtr9xTFgCb42sZOtWF50Ic",
    authDomain: "miniprojectteam16.firebaseapp.com",
    projectId: "miniprojectteam16",
    storageBucket: "miniprojectteam16.firebasestorage.app",
    messagingSenderId: "212222206184",
    appId: "1:212222206184:web:b0b0a2b84707012b51695d",
    measurementId: "G-E83BBDXPYK"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export default app;
