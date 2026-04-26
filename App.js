import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

async function checkForUpdate() {
  try {
    // Only runs in production builds — not in Expo Go dev mode
    if (__DEV__) return;

    var update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      Alert.alert(
        'Update Available',
        'A new version of Fix Kohalpur is ready. Restart now to get the latest features.',
        [
          {
            text: 'Later',
            style: 'cancel',
          },
          {
            text: 'Restart Now',
            onPress: function () { Updates.reloadAsync(); },
          },
        ]
      );
    }
  } catch (e) {
    // Silently fail — update check should never crash the app
    console.log('Update check skipped:', e.message);
  }
}

export default function App() {
  useEffect(function () {
    checkForUpdate();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#E63946" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}