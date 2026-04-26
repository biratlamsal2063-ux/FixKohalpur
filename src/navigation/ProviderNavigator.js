import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProviderDashboardScreen from '../screens/provider/ProviderDashboardScreen';
import ChatScreen from '../screens/messages/ChatScreen';

var Stack = createNativeStackNavigator();

var RED_HEADER = {
    headerStyle: { backgroundColor: '#E63946' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: '700' },
    headerBackTitleVisible: false,
};

export default function ProviderNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="ProviderDashboard"
                component={ProviderDashboardScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ProviderChat"
                component={ChatScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}