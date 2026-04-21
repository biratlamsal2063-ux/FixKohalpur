import React from 'react';
import {
    View, Text, Image, TouchableOpacity,
    StyleSheet, ScrollView, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { globalStyles } from '../../styles/globalStyles';

export default function ServiceDetailScreen({ route, navigation }) {
    const { provider } = route.params;

    const handleCall = () => {
        const phone = `tel:${provider.phone}`;
        Linking.canOpenURL(phone)
            .then(supported => {
                if (supported) Linking.openURL(phone);
                else Alert.alert('Error', 'Unable to make a call on this device.');
            });
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
            {/* Hero */}
            <Image
                source={{ uri: provider.photoURL || 'https://via.placeholder.com/400x200' }}
                style={styles.hero}
            />

            <View style={styles.body}>
                <Text style={styles.name}>{provider.name}</Text>
                <Text style={styles.type}>
                    {provider.serviceType === 'electrician' ? '⚡ Electrician' : '🔧 Plumber'}
                </Text>

                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Ionicons name="star" size={18} color={COLORS.accent} />
                        <Text style={styles.statValue}>{provider.rating?.toFixed(1) || 'New'}</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                    <View style={styles.stat}>
                        <Ionicons name="briefcase-outline" size={18} color={COLORS.secondary} />
                        <Text style={styles.statValue}>{provider.jobsCompleted || 0}</Text>
                        <Text style={styles.statLabel}>Jobs Done</Text>
                    </View>
                    <View style={styles.stat}>
                        <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.statValue}>{provider.experience || '1'}yrs</Text>
                        <Text style={styles.statLabel}>Experience</Text>
                    </View>
                </View>

                <Text style={styles.sectionHead}>About</Text>
                <Text style={styles.about}>{provider.bio || 'Experienced professional serving the Kohalpur area.'}</Text>

                <Text style={styles.sectionHead}>Rate</Text>
                <Text style={styles.rate}>Rs. {provider.ratePerHour} / hour</Text>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                        <Ionicons name="call-outline" size={20} color="#fff" />
                        <Text style={styles.callBtnText}>Call Now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={globalStyles.primaryButton}
                        onPress={() => navigation.navigate('Booking', { provider })}
                    >
                        <Text style={globalStyles.primaryButtonText}>Book Service</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    hero: { width: '100%', height: 220, resizeMode: 'cover' },
    body: { padding: 20 },
    name: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
    type: { fontSize: 15, color: COLORS.textSecondary, marginTop: 4 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
    stat: { alignItems: 'center', gap: 4 },
    statValue: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
    statLabel: { fontSize: 12, color: COLORS.textSecondary },
    sectionHead: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16, marginBottom: 6 },
    about: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
    rate: { fontSize: 18, fontWeight: '700', color: COLORS.secondary },
    actions: { marginTop: 24, gap: 12 },
    callBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: COLORS.success, borderRadius: 10, paddingVertical: 14,
    },
    callBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});