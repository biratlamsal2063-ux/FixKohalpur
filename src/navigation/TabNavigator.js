import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

import HomeScreen from '../screens/home/HomeScreen';
import ServiceDetailScreen from '../screens/service/ServiceDetailScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ReviewScreen from '../screens/reviews/ReviewScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function HomeStackNavigator() {
    return (
        <HomeStack.Navigator
            screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: 'Fix Kohalpur' }} />
            <HomeStack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ title: 'Service Details' }} />
            <HomeStack.Screen name="Booking" component={BookingScreen} options={{ title: 'Book Service' }} />
            <HomeStack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
            <HomeStack.Screen name="Review" component={ReviewScreen} options={{ title: 'Leave a Review' }} />
        </HomeStack.Navigator>
    );
}

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.gray,
                tabBarStyle: { paddingBottom: 5, height: 60 },
                tabBarIcon: ({ color, size }) => {
                    const icons = {
                        HomeTab: 'home-outline',
                        Profile: 'person-outline',
                    };
                    return <Ionicons name={icons[route.name] || 'grid-outline'} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Home' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}