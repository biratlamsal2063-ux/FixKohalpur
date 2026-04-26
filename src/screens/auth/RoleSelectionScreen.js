import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function RoleSelectScreen(props) {
    var navigation = props.navigation;
    var insets = useSafeAreaInsets();

    return (
        <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="light-content" backgroundColor="#E63946" />

            <View style={styles.top}>
                <Text style={styles.logo}>🔧</Text>
                <Text style={styles.appName}>Fix Kohalpur</Text>
                <Text style={styles.tagline}>Home services at your doorstep</Text>
            </View>

            <View style={styles.middle}>
                <Text style={styles.question}>I want to...</Text>

                <TouchableOpacity
                    style={styles.roleCard}
                    onPress={function () { navigation.navigate('Login'); }}
                    activeOpacity={0.85}
                >
                    <View style={[styles.roleIcon, { backgroundColor: '#EBF4F9' }]}>
                        <Text style={{ fontSize: 32 }}>🏠</Text>
                    </View>
                    <View style={styles.roleInfo}>
                        <Text style={styles.roleTitle}>Book a Service</Text>
                        <Text style={styles.roleSub}>Find electricians and plumbers near me</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#A8A8A8" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.roleCard}
                    onPress={function () { navigation.navigate('ProviderRegister'); }}
                    activeOpacity={0.85}
                >
                    <View style={[styles.roleIcon, { backgroundColor: '#FFF0F1' }]}>
                        <Text style={{ fontSize: 32 }}>⚡</Text>
                    </View>
                    <View style={styles.roleInfo}>
                        <Text style={styles.roleTitle}>Offer My Services</Text>
                        <Text style={styles.roleSub}>Register as an electrician or plumber</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#A8A8A8" />
                </TouchableOpacity>
            </View>

            <View style={styles.bottom}>
                <Text style={styles.alreadyText}>Already have an account?</Text>
                <TouchableOpacity onPress={function () { navigation.navigate('Login'); }}>
                    <Text style={styles.loginLink}>Login here</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

var styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F1FAEE',
        justifyContent: 'space-between',
    },
    top: {
        backgroundColor: '#E63946',
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    logo: { fontSize: 56, marginBottom: 12 },
    appName: { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
    tagline: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 6 },

    middle: { flex: 1, padding: 24, justifyContent: 'center' },
    question: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1D',
        marginBottom: 16,
        textAlign: 'center',
    },

    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        gap: 14,
        elevation: 2,
    },
    roleIcon: {
        width: 60,
        height: 60,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    roleInfo: { flex: 1 },
    roleTitle: { fontSize: 15, fontWeight: '700', color: '#1D1D1D', marginBottom: 4 },
    roleSub: { fontSize: 12, color: '#6B6B6B', lineHeight: 18 },

    bottom: {
        alignItems: 'center',
        paddingBottom: 24,
        gap: 6,
    },
    alreadyText: { fontSize: 13, color: '#6B6B6B' },
    loginLink: { fontSize: 14, fontWeight: '700', color: '#E63946' },
});