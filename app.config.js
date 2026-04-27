import 'dotenv/config';

export default {
    expo: {
        name: 'Fix Kohalpur',
        slug: 'FixKohalpur',
        owner: 'birat_lamsal1',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/icon.png',
        splash: {
            image: './assets/splash.png',
            resizeMode: 'contain',
            backgroundColor: '#E63946',
        },
        updates: {
            enabled: true,
            checkAutomatically: 'ON_LOAD',
            fallbackToCacheTimeout: 0,
        },
        runtimeVersion: {
            policy: 'appVersion',
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/adaptive-icon.png',
                backgroundColor: '#E63946',
            },
            package: 'com.fixkohalpur.app',
            permissions: [
                'NOTIFICATIONS',
                'ACCESS_FINE_LOCATION',
                'ACCESS_COARSE_LOCATION',
                'CAMERA',
                'READ_EXTERNAL_STORAGE',
                'WRITE_EXTERNAL_STORAGE',
            ],
        },
        ios: {
            bundleIdentifier: 'com.fixkohalpur.app',
            supportsTablet: false,
        },
        extra: {
            // These come from .env locally and EAS Secrets in production
            firebaseApiKey: process.env.FIREBASE_API_KEY,
            firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
            firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
            firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            firebaseAppId: process.env.FIREBASE_APP_ID,
            eas: {
                projectId: "7bda56c4-f709-4c2b-a84f-860c4fa98c17",
            },
        },
    },
};