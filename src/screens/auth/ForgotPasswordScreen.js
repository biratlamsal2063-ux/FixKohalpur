import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { resetPassword } from '../../services/authService';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../constants/colors';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email.trim()) { Alert.alert('Error', 'Enter your email.'); return; }
        setLoading(true);
        const result = await resetPassword(email.trim());
        setLoading(false);
        if (result.success) {
            Alert.alert('Success', 'Password reset email sent. Check your inbox.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } else {
            Alert.alert('Error', result.error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your registered email to receive a reset link.</Text>
            <TextInput
                style={globalStyles.inputField}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            <TouchableOpacity style={globalStyles.primaryButton} onPress={handleReset} disabled={loading}>
                <Text style={globalStyles.primaryButtonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: COLORS.background },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 8, color: COLORS.textPrimary },
    subtitle: { color: COLORS.textSecondary, marginBottom: 20, fontSize: 14 },
});