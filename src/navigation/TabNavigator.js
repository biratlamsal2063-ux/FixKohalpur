import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Home Stack
import HomeScreen from '../screens/home/HomeScreen';
import ServiceDetailScreen from '../screens/service/ServiceDetailScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import ReviewScreen from '../screens/reviews/ReviewScreen';

// Bookings Stack
import BookingsScreen from '../screens/booking/BookingScreen';

// Messages Stack
import MessagesScreen from '../screens/messages/MessagesScreen';
import ChatScreen from '../screens/messages/ChatScreen';

// Profile Stack
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

// Shared screens
import TrackServiceScreen from '../screens/tracking/TrackServiceScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const BookingsStack = createNativeStackNavigator();
const MessagesStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const RED_HEADER = {
    headerStyle: { backgroundColor: '#E63946' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: '700' },
    headerBackTitleVisible: false,
};

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
                options={{ title: 'Service Details', ...RED_HEADER }}
            />
            <HomeStack.Screen
                name="Booking"
                component={BookingScreen}
                options={{ title: 'Book Service', ...RED_HEADER }}
            />
            <HomeStack.Screen
                name="Payment"
                component={PaymentScreen}
                options={{ title: 'Payment', ...RED_HEADER }}
            />
            <HomeStack.Screen
                name="Review"
                component={ReviewScreen}
                options={{ title: 'Leave a Review', ...RED_HEADER }}
            />
            <HomeStack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ headerShown: false }}
            />
            <HomeStack.Screen
                name="TrackService"
                component={TrackServiceScreen}
                options={{ title: 'Track Service', ...RED_HEADER }}
            />
        </HomeStack.Navigator>
    );
}

// ── BOOKINGS STACK ──────────────────────────────────────
function BookingsStackNavigator() {
    return (
        <BookingsStack.Navigator>
            <BookingsStack.Screen
                name="BookingsList"
                component={BookingsScreen}
                options={{ headerShown: false }}
            />
            <BookingsStack.Screen
                name="TrackService"
                component={TrackServiceScreen}
                options={{ title: 'Track Service', ...RED_HEADER }}
            />
            <BookingsStack.Screen
                name="Payment"
                component={PaymentScreen}
                options={{ title: 'Payment', ...RED_HEADER }}
            />
            <BookingsStack.Screen
                name="Review"
                component={ReviewScreen}
                options={{ title: 'Leave a Review', ...RED_HEADER }}
            />
            <BookingsStack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ headerShown: false }}
            />
        </BookingsStack.Navigator>
    );
}

// ── MESSAGES STACK ──────────────────────────────────────
function MessagesStackNavigator() {
    return (
        <MessagesStack.Navigator>
            <MessagesStack.Screen
                name="MessagesList"
                component={MessagesScreen}
                options={{ headerShown: false }}
            />
            <MessagesStack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ headerShown: false }}
            />
            <MessagesStack.Screen
                name="TrackService"
                component={TrackServiceScreen}
                options={{ title: 'Track Service', ...RED_HEADER }}
            />
        </MessagesStack.Navigator>
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
                options={{ title: 'Edit Profile', ...RED_HEADER }}
            />
            {/* MyBookings navigates to the Bookings tab instead */}
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
                tabBarIcon: ({ color, focused }) => {
                    const icons = {
                        HomeTab: focused ? 'home' : 'home-outline',
                        Bookings: focused ? 'calendar' : 'calendar-outline',
                        Messages: focused ? 'chatbubble' : 'chatbubble-outline',
                        Profile: focused ? 'person' : 'person-outline',
                    };
                    return <Ionicons name={icons[route.name]} size={22} color={color} />;
                },
            })}
        >
            <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Home' }} />
            <Tab.Screen name="Bookings" component={BookingsStackNavigator} options={{ title: 'Bookings' }} />
            <Tab.Screen name="Messages" component={MessagesStackNavigator} options={{ title: 'Messages' }} />
            <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
}