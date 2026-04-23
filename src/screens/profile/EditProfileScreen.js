import React, { useState, useContext } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, ScrollView, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase/firebaseConfig';
import { AuthContext } from '../../contexts/AuthContext';

export default function EditProfileScreen({ route, navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const existing = route.params?.profile || {};

    const [name, setName] = useState(existing.name || '');
    const [phone, setPhone] = useState(existing.phone || '');
    const [address, setAddress] = useState(existing.address || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Full name is required.');
            return;
        }
        setLoading(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                name: name.trim(),
                phone: phone.trim(),
                address: address.trim(),
            });
            Alert.alert('Saved!', 'Your profile has been updated.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (e) {
            Alert.alert('Error', 'Could not update profile. Please try again.');
        }
        setLoading(false);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F1FAEE' }}>
            <StatusBar barStyle="light-content" backgroundColor="#E63946" />
            <ScrollView
                contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Avatar preview */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.avatarHint}>Profile photo coming soon</Text>
                </View>

                {/* Form */}
                <View style={styles.formCard}>
                    <Field
                        label="Full Name"
                        icon="person-outline"
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your full name"
                        autoCapitalize="words"
                    />
                    <Field
                        label="Phone Number"
                        icon="call-outline"
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="98XXXXXXXX"
                        keyboardType="phone-pad"
                        isLast={false}
                    />
                    <Field
                        label="Address"
                        icon="location-outline"
                        value={address}
                        onChangeText={setAddress}
                        placeholder="e.g. Kohalpur-5, Banke"
                        isLast
                    />
                </View>

                {/* Read-only info */}
                <View style={styles.readOnlyCard}>
                    <Text style={styles.readOnlyTitle}>Account Info</Text>
                    <View style={styles.readOnlyRow}>
                        <Ionicons name="mail-outline" size={16} color="#A8A8A8" />
                        <Text style={styles.readOnlyLabel}>Email</Text>
                        <Text style={styles.readOnlyValue} numberOfLines={1}>{user?.email}</Text>
                    </View>
                    <View style={[styles.readOnlyRow, { borderBottomWidth: 0 }]}>
                        <Ionicons name="shield-checkmark-outline" size={16} color="#A8A8A8" />
                        <Text style={styles.readOnlyLabel}>Role</Text>
                        <Text style={styles.readOnlyValue}>Customer</Text>
                    </View>
                    <Text style={styles.readOnlyNote}>
                        Email and role cannot be changed. Contact support if needed.
                    </Text>
                </View>

                {/* Save button */}
                <TouchableOpacity
                    style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                    <Text style={styles.saveBtnText}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

// Reusable field component
function Field({ label, icon, value, onChangeText, placeholder, keyboardType, autoCapitalize, isLast }) {
    return (
        <View style={[styles.fieldWrap, !isLast && styles.fieldBorder]}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.fieldRow}>
                <Ionicons name={icon} size={16} color="#A8A8A8" style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.fieldInput}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#C0C0C0"
                    keyboardType={keyboardType || 'default'}
                    autoCapitalize={autoCapitalize || 'none'}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },

    // Avatar
    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 8,
    },
    avatar: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#E63946',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 8,
        borderWidth: 3, borderColor: '#fff',
        shadowColor: '#E63946',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    avatarText: { fontSize: 30, fontWeight: '700', color: '#fff' },
    avatarHint: { fontSize: 12, color: '#A8A8A8' },

    // Form card
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        overflow: 'hidden',
        marginBottom: 14,
    },
    fieldWrap: { padding: 14 },
    fieldBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    fieldLabel: {
        fontSize: 11, fontWeight: '700',
        color: '#A8A8A8', textTransform: 'uppercase',
        letterSpacing: 0.5, marginBottom: 6,
    },
    fieldRow: { flexDirection: 'row', alignItems: 'center' },
    fieldInput: {
        flex: 1, fontSize: 14,
        color: '#1D1D1D', padding: 0,
    },

    // Read-only card
    readOnlyCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        overflow: 'hidden',
        marginBottom: 24,
        padding: 14,
    },
    readOnlyTitle: {
        fontSize: 11, fontWeight: '700',
        color: '#A8A8A8', textTransform: 'uppercase',
        letterSpacing: 0.5, marginBottom: 12,
    },
    readOnlyRow: {
        flexDirection: 'row', alignItems: 'center',
        gap: 8, paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
    },
    readOnlyLabel: { fontSize: 13, color: '#6B6B6B', fontWeight: '500', width: 50 },
    readOnlyValue: { flex: 1, fontSize: 13, color: '#1D1D1D', fontWeight: '600' },
    readOnlyNote: {
        fontSize: 11, color: '#A8A8A8',
        marginTop: 10, lineHeight: 16,
    },

    // Buttons
    saveBtn: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8,
        backgroundColor: '#E63946',
        borderRadius: 14, paddingVertical: 15,
        marginBottom: 10,
        shadowColor: '#E63946',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    cancelBtn: {
        alignItems: 'center', paddingVertical: 12,
    },
    cancelBtnText: { fontSize: 14, color: '#A8A8A8', fontWeight: '500' },
});