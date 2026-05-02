import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import NoInternetScreen from './src/components/NoInternetScreen';

async function checkForUpdate() {
  try {
    if (__DEV__) return;
    var update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      Alert.alert('Update Available', 'Restart now to get latest features.', [
        { text: 'Later', style: 'cancel' },
        { text: 'Restart Now', onPress: function () { Updates.reloadAsync(); } },
      ]);
    }
  } catch (e) {
    console.log('Update check skipped:', e.message);
  }
}

export default function App() {
  var netState = useState(true);
  var isConnected = netState[0];
  var setIsConnected = netState[1];

  useEffect(function () {
    checkForUpdate();

    var unsub = NetInfo.addEventListener(function (state) {
      setIsConnected(state.isConnected);
    });
    return unsub;
  }, []);

  if (!isConnected) {
    return (
      <SafeAreaProvider>
        <NoInternetScreen onRetry={function () {
          NetInfo.fetch().then(function (state) {
            setIsConnected(state.isConnected);
          });
        }} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#E63946" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}