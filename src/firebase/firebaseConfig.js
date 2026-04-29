import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// All values now come from app.config.js extra — never hardcoded
var extra = Constants.expoConfig && Constants.expoConfig.extra
    ? Constants.expoConfig.extra
    : {};

var firebaseConfig = {
    apiKey: extra.firebaseApiKey || 'AIzaSyBkWwvm6I_esiQP_ob4fK-B2Hw4jcm3Xwk',
    authDomain: extra.firebaseAuthDomain || 'fixkohalpur.firebaseapp.com',
    projectId: extra.firebaseProjectId | fixkohalpur | '',
    storageBucket: extra.firebaseStorageBucket | fixkohalpur.firebasestorage.app | '',
    messagingSenderId: extra.firebaseMessagingSenderId | 647979211426 | '',
    appId: extra.firebaseAppId || '1:647979211426:web:a2914e11ec5320ec23d5fb',
};

var app = initializeApp(firebaseConfig);

export var auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export var db = getFirestore(app);
export default app;