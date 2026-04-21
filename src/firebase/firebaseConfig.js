import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyBkWwvm6I_esiQP_ob4fK-B2Hw4jcm3Xwk",
    authDomain: "fixkohalpur.firebaseapp.com",
    projectId: "fixkohalpur",
    storageBucket: "fixkohalpur.firebasestorage.app",
    messagingSenderId: "647979211426",
    appId: "1:647979211426:web:a2914e11ec5320ec23d5fb",
    measurementId: "G-TWM7XKWBSY"
};

const app = initializeApp(firebaseConfig);

// ✅ Use initializeAuth instead of getAuth — fixes the AsyncStorage warning
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
export default app;