import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/authService';
import { COLORS } from '../../constants/colors';
import { globalStyles } from '../../styles/globalStyles';

export default function ProfileScreen() {
    const { user } = useContext(AuthContext);

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logoutUser },
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.name}>{user?.displayName || 'User'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <TouchableOpacity style={[globalStyles.primaryButton, { marginTop: 30 }]} onPress={handleLogout}>
                <Text style={globalStyles.primaryButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, padding: 24 },
    name: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
    email: { fontSize: 15, color: COLORS.textSecondary, marginTop: 6 },
});