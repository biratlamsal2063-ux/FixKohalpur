import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import ProviderNavigator from './ProviderNavigator';

var Stack = createNativeStackNavigator();

export default function AppNavigator() {
    var authCtx = useContext(AuthContext);
    var user = authCtx.user;
    var role = authCtx.role;
    var loading = authCtx.loading;

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1FAEE' }}>
                <ActivityIndicator size="large" color="#E63946" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {!user ? (
                <AuthNavigator />
            ) : role === 'provider' ? (
                <ProviderNavigator />
            ) : (
                <TabNavigator />
            )}
        </NavigationContainer>
    );
}