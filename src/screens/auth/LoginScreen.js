import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { loginUser } from '../../services/authService';
import { COLORS } from '../../constants/colors';
import { globalStyles } from '../../styles/globalStyles';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        setLoading(true);
        const result = await loginUser(email.trim(), password);
        setLoading(false);
        if (!result.success) {
            Alert.alert('Login Failed', result.error);
        }
        // AuthContext auto-updates on success via onAuthStateChanged
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.logo}>🔧 Fix Kohalpur</Text>
                <Text style={styles.title}>Welcome Back</Text>

                <TextInput
                    style={globalStyles.inputField}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={globalStyles.inputField}
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    style={[globalStyles.primaryButton, loading && { opacity: 0.7 }]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={globalStyles.primaryButtonText}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.link}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.link}>Don't have an account? <Text style={{ color: COLORS.primary }}>Sign Up</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: COLORS.background,
    },
    logo: { fontSize: 32, textAlign: 'center', marginBottom: 8 },
    title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 24, color: COLORS.textPrimary },
    link: { textAlign: 'center', marginTop: 14, color: COLORS.textSecondary, fontSize: 14 },
});