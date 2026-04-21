import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProviderCard({ provider, onPress }) {
    const isElec = provider.serviceType === 'electrician';

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: isElec ? '#FFF0F1' : '#EBF4F9' }]}>
                <Text style={{ fontSize: 24 }}>{isElec ? '⚡' : '🔧'}</Text>
            </View>

            {/* Info */}
            <View style={styles.body}>
                <Text style={styles.name} numberOfLines={1}>{provider.name}</Text>
                <Text style={styles.type}>
                    {isElec ? 'Electrician' : 'Plumber'} · {provider.experience || 1} yrs exp
                </Text>
                <View style={styles.metaRow}>
                    <Ionicons name="star" size={11} color="#F4A261" />
                    <Text style={styles.rating}> {provider.rating?.toFixed(1) || 'New'}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.reviews}>{provider.reviewCount || 0} reviews</Text>
                    <View style={styles.dot} />
                    <Text style={styles.price}>Rs.{provider.ratePerHour}/hr</Text>
                </View>
            </View>

            {/* Badge */}
            <View style={[styles.badge, provider.isAvailable ? styles.badgeAvail : styles.badgeBusy]}>
                <View style={[styles.badgeDot, {
                    backgroundColor: provider.isAvailable ? '#1D9E75' : '#E24B4A'
                }]} />
                <Text style={[styles.badgeText, {
                    color: provider.isAvailable ? '#0F6E56' : '#A32D2D'
                }]}>
                    {provider.isAvailable ? 'Available' : 'Busy'}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 14,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 2,
    },
    avatar: {
        width: 62,

        height: 62,

        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    name: {
        fontSize: 14,

        fontWeight: '700',
        color: '#1D1D1D',
        marginBottom: 3,
    },
    type: {
        fontSize: 12,              // ← increased from 11
        color: '#6B6B6B',
        marginBottom: 6,           // ← increased from 5
    },



    metaRow: { flexDirection: 'row', alignItems: 'center' },
    rating: { fontSize: 11, fontWeight: '600', color: '#1D1D1D' },
    dot: { width: 3, height: 3, backgroundColor: '#D0D0D0', borderRadius: 2, marginHorizontal: 5 },
    reviews: { fontSize: 10, color: '#A8A8A8' },
    price: { fontSize: 11, fontWeight: '600', color: '#457B9D' },
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 20, alignSelf: 'flex-start',
    },
    badgeAvail: { backgroundColor: '#E1F5EE' },
    badgeBusy: { backgroundColor: '#FCEBEB' },
    badgeDot: { width: 5, height: 5, borderRadius: 3 },
    badgeText: { fontSize: 9, fontWeight: '700' },
    body: { flex: 1, minWidth: 0 },
});