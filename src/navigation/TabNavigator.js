import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Home Stack Screens
import HomeScreen from '../screens/home/HomeScreen';
import ServiceDetailScreen from '../screens/service/ServiceDetailScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import ReviewScreen from '../screens/reviews/ReviewScreen';

// Profile Stack Screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// ── HOME STACK ──────────────────────────────────────────
function HomeStackNavigator() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            <HomeStack.Screen
                name="ServiceDetail"
                component={ServiceDetailScreen}
                options={{
                    title: 'Service Details',
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: '700' },
                    headerBackTitleVisible: false,
                }}
            />
            <HomeStack.Screen
                name="Booking"
                component={BookingScreen}
                options={{
                    title: 'Book Service',
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: '700' },
                    headerBackTitleVisible: false,
                }}
            />
            <HomeStack.Screen
                name="Payment"
                component={PaymentScreen}
                options={{
                    title: 'Payment',
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: '700' },
                    headerBackTitleVisible: false,
                }}
            />
            <HomeStack.Screen
                name="Review"
                component={ReviewScreen}
                options={{
                    title: 'Leave a Review',
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: '700' },
                    headerBackTitleVisible: false,
                }}
            />
        </HomeStack.Navigator>
    );
}

// ── PROFILE STACK ───────────────────────────────────────
function ProfileStackNavigator() {
    return (
        <ProfileStack.Navigator>
            <ProfileStack.Screen
                name="ProfileMain"
                component={ProfileScreen}
                options={{ headerShown: false }}
            />
            <ProfileStack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{
                    title: 'Edit Profile',
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: '700' },
                    headerBackTitleVisible: false,
                }}
            />
        </ProfileStack.Navigator>
    );
}

// ── BOTTOM TABS ─────────────────────────────────────────
export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#E63946',
                tabBarInactiveTintColor: '#A8A8A8',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#EEEEEE',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 6,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                },
                tabBarIcon: ({ color, size, focused }) => {
                    const icons = {
                        HomeTab: focused ? 'home' : 'home-outline',
                        Bookings: focused ? 'calendar' : 'calendar-outline',
                        Messages: focused ? 'chatbubble' : 'chatbubble-outline',
                        Profile: focused ? 'person' : 'person-outline',
                    };
                    return (
                        <Ionicons
                            name={icons[route.name]}
                            size={22}
                            color={color}
                        />
                    );
                },
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStackNavigator}
                options={{ title: 'Home' }}
            />
            <Tab.Screen
                name="Bookings"
                component={BookingsPlaceholder}
                options={{ title: 'Bookings' }}
            />
            <Tab.Screen
                name="Messages"
                component={MessagesPlaceholder}
                options={{ title: 'Messages' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStackNavigator}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
}

// ── PLACEHOLDERS (replace when screens are built) ───────
import { View, Text } from 'react-native';

function BookingsPlaceholder() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1FAEE' }}>
            <Text style={{ fontSize: 36 }}>📅</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1D1D1D', marginTop: 12 }}>My Bookings</Text>
            <Text style={{ fontSize: 13, color: '#A8A8A8', marginTop: 6 }}>Coming soon</Text>
        </View>
    );
}

function MessagesPlaceholder() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1FAEE' }}>
            <Text style={{ fontSize: 36 }}>💬</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1D1D1D', marginTop: 12 }}>Messages</Text>
            <Text style={{ fontSize: 13, color: '#A8A8A8', marginTop: 6 }}>Coming soon</Text>
        </View>
    );
}