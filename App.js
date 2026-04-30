import React, { useEffect } from 'react';
import { Alert, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import * as Updates from 'expo-updates';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#E63946', marginBottom: 12 }}>
            App Error
          </Text>
          <ScrollView style={{ maxHeight: 400 }}>
            <Text style={{ fontSize: 13, color: '#333', marginBottom: 8 }}>
              {this.state.error && this.state.error.toString()}
            </Text>
          </ScrollView>
          <TouchableOpacity
            style={{ backgroundColor: '#E63946', padding: 14, borderRadius: 10, marginTop: 20 }}
            onPress={function () { Updates.reloadAsync(); }}
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
              Restart App
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

async function checkForUpdate() {
  try {
    if (__DEV__) return;
    var update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      Alert.alert('Update Available', 'Restart now to update.', [
        { text: 'Later', style: 'cancel' },
        { text: 'Restart Now', onPress: function () { Updates.reloadAsync(); } },
      ]);
    }
  } catch (e) {
    console.log('Update check skipped:', e.message);
  }
}

export default function App() {
  useEffect(function () {
    checkForUpdate();
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <StatusBar style="light" backgroundColor="#E63946" />
          <AppNavigator />
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}