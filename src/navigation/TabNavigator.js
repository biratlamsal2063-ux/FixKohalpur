import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/home/HomeScreen';
import ServiceDetailScreen from '../screens/service/ServiceDetailScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import ReviewScreen from '../screens/reviews/ReviewScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ChatScreen from '../screens/messages/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import TrackServiceScreen from '../screens/tracking/TrackServiceScreen';

var Tab = createBottomTabNavigator();
var HomeStack = createNativeStackNavigator();
var BookingsStack = createNativeStackNavigator();
var MessagesStack = createNativeStackNavigator();
var ProfileStack = createNativeStackNavigator();

var RED_HEADER = {
    headerStyle: { backgroundColor: '#E63946' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: '700' },
    headerBackTitleVisible: false,
};

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
                options={Object.assign({ title: 'Service Details' }, RED_HEADER)}
            />
            <HomeStack.Screen
                name="Booking"
                component={BookingScreen}
                options={Object.assign({ title: 'Book Service' }, RED_HEADER)}
            />
            <HomeStack.Screen
                name="Payment"
                component={PaymentScreen}
                options={Object.assign({ title: 'Payment' }, RED_HEADER)}
            />
            <HomeStack.Screen
                name="Review"
                component={ReviewScreen}
                options={Object.assign({ title: 'Leave a Review' }, RED_HEADER)}
            />
            <HomeStack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ headerShown: false }}
            />
            <HomeStack.Screen
                name="TrackService"
                component={TrackServiceScreen}
                options={Object.assign({ title: 'Track Service' }, RED_HEADER)}
            />
        </HomeStack.Navigator>
    );
}

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
                options={Object.assign({ title: 'Track Service' }, RED_HEADER)}
            />
            <BookingsStack.Screen
                name="Payment"
                component={PaymentScreen}
                options={Object.assign({ title: 'Payment' }, RED_HEADER)}
            />
            <BookingsStack.Screen
                name="Review"
                component={ReviewScreen}
                options={Object.assign({ title: 'Leave a Review' }, RED_HEADER)}
            />
            <BookingsStack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ headerShown: false }}
            />
        </BookingsStack.Navigator>
    );
}

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
                options={Object.assign({ title: 'Track Service' }, RED_HEADER)}
            />
        </MessagesStack.Navigator>
    );
}

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
                options={Object.assign({ title: 'Edit Profile' }, RED_HEADER)}
            />
        </ProfileStack.Navigator>
    );
}

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={function (props) {
                var route = props.route;
                var icons = {
                    HomeTab: 'home',
                    HomeTabOutline: 'home-outline',
                    Bookings: 'calendar',
                    BookingsOutline: 'calendar-outline',
                    Messages: 'chatbubble',
                    MessagesOutline: 'chatbubble-outline',
                    Profile: 'person',
                    ProfileOutline: 'person-outline',
                };
                return {
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
                    tabBarIcon: function (iconProps) {
                        var color = iconProps.color;
                        var focused = iconProps.focused;
                        var name = route.name;
                        var iconName;
                        if (name === 'HomeTab') {
                            iconName = focused ? 'home' : 'home-outline';
                        } else if (name === 'Bookings') {
                            iconName = focused ? 'calendar' : 'calendar-outline';
                        } else if (name === 'Messages') {
                            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
                        } else {
                            iconName = focused ? 'person' : 'person-outline';
                        }
                        return React.createElement(Ionicons, { name: iconName, size: 22, color: color });
                    },
                };
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStackNavigator}
                options={{ title: 'Home' }}
            />
            <Tab.Screen
                name="Bookings"
                component={BookingsStackNavigator}
                options={{ title: 'Bookings' }}
            />
            <Tab.Screen
                name="Messages"
                component={MessagesStackNavigator}
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