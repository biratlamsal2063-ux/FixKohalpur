import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { registerUser } from '../../services/authService';
import { COLORS } from '../../constants/colors';
import { globalStyles } from '../../styles/globalStyles';

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !phone || !password) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        const result = await registerUser(name, email, password, phone);
        setLoading(false);
        if (!result.success) {
            Alert.alert('Registration Failed', result.error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Create Account</Text>

                {[
                    { placeholder: 'Full Name', value: name, setter: setName },
                    { placeholder: 'Email', value: email, setter: setEmail, keyboardType: 'email-address', autoCapitalize: 'none' },
                    { placeholder: 'Phone (98XXXXXXXX)', value: phone, setter: setPhone, keyboardType: 'phone-pad' },
                    { placeholder: 'Password (min 6 chars)', value: password, setter: setPassword, secureTextEntry: true },
                ].map((field, i) => (
                    <TextInput
                        key={i}
                        style={globalStyles.inputField}
                        {...field}
                        onChangeText={field.setter}
                    />
                ))}

                <TouchableOpacity
                    style={[globalStyles.primaryButton, loading && { opacity: 0.7 }]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={globalStyles.primaryButtonText}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Already have an account? <Text style={{ color: COLORS.primary }}>Login</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: COLORS.background },
    title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 24, color: COLORS.textPrimary },
    link: { textAlign: 'center', marginTop: 14, color: COLORS.textSecondary, fontSize: 14 },
});