// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCd9JHSSIiylrMMSJWB_d10ZIVq_KzzwNE",
    authDomain: "synk-85b86.firebaseapp.com",
    projectId: "synk-85b86",
    storageBucket: "synk-85b86.appspot.com",
    messagingSenderId: "238927183617",
    appId: "1:238927183617:web:113a7fe1309f43cd6f6500"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app); // exporting our auth capabilities

const db = getFirestore(app)
const storage = getStorage(app);

export { auth, db, storage };