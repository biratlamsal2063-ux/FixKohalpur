import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import LoadingSpinner from '../components/LoadingSpinner';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <LoadingSpinner />;

    return (
        <NavigationContainer>
            {user ? <TabNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}