import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function ProviderCard({ provider, onPress }) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
            <Image
                source={{ uri: provider.photoURL || 'https://via.placeholder.com/60' }}
                style={styles.avatar}
            />
            <View style={styles.info}>
                <Text style={styles.name}>{provider.name}</Text>
                <Text style={styles.service}>{provider.serviceType === 'electrician' ? '⚡ Electrician' : '🔧 Plumber'}</Text>
                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color={COLORS.accent} />
                    <Text style={styles.rating}> {provider.rating?.toFixed(1) || 'New'}</Text>
                    <Text style={styles.reviews}> ({provider.reviewCount || 0} reviews)</Text>
                </View>
                <Text style={styles.price}>Rs. {provider.ratePerHour}/hr</Text>
            </View>
            {provider.isAvailable ? (
                <View style={styles.badge}><Text style={styles.badgeText}>Available</Text></View>
            ) : (
                <View style={[styles.badge, { backgroundColor: COLORS.gray }]}><Text style={styles.badgeText}>Busy</Text></View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 16,
        marginVertical: 6,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        alignItems: 'center',
    },
    avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12, backgroundColor: COLORS.lightGray },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
    service: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    rating: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
    reviews: { fontSize: 12, color: COLORS.textSecondary },
    price: { fontSize: 13, color: COLORS.secondary, fontWeight: '600', marginTop: 4 },
    badge: {
        backgroundColor: COLORS.success,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});