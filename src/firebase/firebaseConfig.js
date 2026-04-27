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
    apiKey: extra.firebaseApiKey || '',
    authDomain: extra.firebaseAuthDomain || '',
    projectId: extra.firebaseProjectId || '',
    storageBucket: extra.firebaseStorageBucket || '',
    messagingSenderId: extra.firebaseMessagingSenderId || '',
    appId: extra.firebaseAppId || '',
};

var app = initializeApp(firebaseConfig);

export var auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export var db = getFirestore(app);
export default app;