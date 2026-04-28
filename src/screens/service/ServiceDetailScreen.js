import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Linking,
    Alert,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ServiceDetailScreen(props) {
    var route = props.route;
    var navigation = props.navigation;
    var insets = useSafeAreaInsets();

    var provider = null;
    if (route && route.params && route.params.provider) {
        provider = route.params.provider;
    }

    if (!provider) {
        return (
            <View style={styles.errorScreen}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorTitle}>Provider not found</Text>
                <Text style={styles.errorSub}>Something went wrong loading this provider.</Text>
                <TouchableOpacity
                    style={styles.errorBtn}
                    onPress={function () { navigation.goBack(); }}
                >
                    <Text style={styles.errorBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    var isElec = provider.serviceType === 'electrician';

    function handleCall() {
        Alert.alert(
            'Book First',
            'Phone number is revealed after you book this provider. This protects both you and the provider.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Book Now',
                    onPress: function () { navigation.navigate('Booking', { provider: provider }); },
                },
            ]
        );
    }

    function handleBook() {
        navigation.navigate('Booking', { provider: provider });
    }

    var statsData = [
        {
            icon: 'star',
            iconColor: '#F4A261',
            value: provider.rating ? provider.rating.toFixed(1) : 'New',
            label: 'Rating',
        },
        {
            icon: 'briefcase-outline',
            iconColor: '#457B9D',
            value: provider.jobsCompleted || 0,
            label: 'Jobs Done',
        },
        {
            icon: 'time-outline',
            iconColor: '#E63946',
            value: (provider.experience || 1) + ' yrs',
            label: 'Experience',
        },
    ];

    return (
        <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="light-content" backgroundColor="#E63946" />

            <ScrollView showsVerticalScrollIndicator={false}>

                <View style={[styles.hero, { backgroundColor: isElec ? '#FFF0F1' : '#EBF4F9' }]}>
                    <Text style={styles.heroEmoji}>{isElec ? '⚡' : '🔧'}</Text>
                </View>

                <View style={styles.body}>

                    <Text style={styles.name}>{provider.name}</Text>
                    <Text style={styles.type}>
                        {isElec ? 'Electrician' : 'Plumber'}
                    </Text>

                    <View style={styles.availRow}>
                        <View style={[
                            styles.availBadge,
                            provider.isAvailable ? styles.availGreen : styles.availRed,
                        ]}>
                            <View style={[
                                styles.availDot,
                                { backgroundColor: provider.isAvailable ? '#1D9E75' : '#E63946' },
                            ]} />
                            <Text style={[
                                styles.availText,
                                { color: provider.isAvailable ? '#0F6E56' : '#A32D2D' },
                            ]}>
                                {provider.isAvailable ? 'Available Now' : 'Currently Busy'}
                            </Text>
                        </View>
                        {provider.isVerified ? (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={12} color="#185FA5" />
                                <Text style={styles.verifiedText}>Verified Pro</Text>
                            </View>
                        ) : null}
                    </View>

                    <View style={styles.statsRow}>
                        {statsData.map(function (s, i) {
                            return (
                                <View key={i} style={styles.statItem}>
                                    <Ionicons name={s.icon} size={20} color={s.iconColor} />
                                    <Text style={styles.statValue}>{s.value}</Text>
                                    <Text style={styles.statLabel}>{s.label}</Text>
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>About</Text>
                        <Text style={styles.cardText}>
                            {provider.bio || 'Experienced professional serving the Kohalpur area with quality service and reliability.'}
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Rate</Text>
                        <View style={styles.rateRow}>
                            <Text style={styles.rateValue}>
                                Rs. {provider.ratePerHour}
                            </Text>
                            <Text style={styles.rateUnit}>/hour</Text>
                        </View>
                        <Text style={styles.rateNote}>
                            Final price depends on job complexity. Discuss before starting.
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Reviews</Text>
                        <View style={styles.reviewSummary}>
                            <Text style={styles.reviewRating}>
                                {provider.rating ? provider.rating.toFixed(1) : '—'}
                            </Text>
                            <View>
                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map(function (i) {
                                        var filled = provider.rating && i <= Math.round(provider.rating);
                                        return (
                                            <Ionicons
                                                key={i}
                                                name={filled ? 'star' : 'star-outline'}
                                                size={16}
                                                color="#F4A261"
                                            />
                                        );
                                    })}
                                </View>
                                <Text style={styles.reviewCount}>
                                    {provider.reviewCount || 0} reviews
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={styles.callBtn}
                            onPress={handleCall}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="lock-closed-outline" size={18} color="#fff" />
                            <Text style={styles.callBtnText}>Book to Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.bookBtn,
                                !provider.isAvailable && styles.bookBtnDisabled,
                            ]}
                            onPress={handleBook}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="calendar-outline" size={18} color="#fff" />
                            <Text style={styles.bookBtnText}>
                                {provider.isAvailable ? 'Book Service' : 'Book Anyway'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}

var styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F1FAEE' },

    errorScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1FAEE',
        padding: 24,
    },
    errorIcon: { fontSize: 44, marginBottom: 12 },
    errorTitle: { fontSize: 18, fontWeight: '700', color: '#1D1D1D', marginBottom: 6 },
    errorSub: { fontSize: 14, color: '#A8A8A8', marginBottom: 20, textAlign: 'center' },
    errorBtn: {
        backgroundColor: '#E63946',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    errorBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    hero: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroEmoji: { fontSize: 80 },

    body: { padding: 20 },

    name: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1D1D1D',
        marginBottom: 4,
    },
    type: {
        fontSize: 15,
        color: '#6B6B6B',
        marginBottom: 12,
        textTransform: 'capitalize',
    },

    availRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    availBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    availGreen: { backgroundColor: '#E1F5EE' },
    availRed: { backgroundColor: '#FCEBEB' },
    availDot: { width: 6, height: 6, borderRadius: 3 },
    availText: { fontSize: 12, fontWeight: '600' },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#EBF4F9',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    verifiedText: { fontSize: 12, color: '#185FA5', fontWeight: '600' },

    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        marginBottom: 16,
        overflow: 'hidden',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        gap: 4,
        borderRightWidth: 1,
        borderRightColor: '#EEEEEE',
    },
    statValue: { fontSize: 16, fontWeight: '700', color: '#1D1D1D' },
    statLabel: { fontSize: 11, color: '#A8A8A8', fontWeight: '500' },

    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        padding: 14,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#A8A8A8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    cardText: {
        fontSize: 14,
        color: '#1D1D1D',
        lineHeight: 22,
    },

    rateRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginBottom: 6,
    },
    rateValue: { fontSize: 28, fontWeight: '700', color: '#E63946' },
    rateUnit: { fontSize: 14, color: '#6B6B6B' },
    rateNote: { fontSize: 12, color: '#A8A8A8', lineHeight: 18 },

    reviewSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    reviewRating: { fontSize: 40, fontWeight: '700', color: '#1D1D1D' },
    starsRow: { flexDirection: 'row', gap: 2, marginBottom: 4 },
    reviewCount: { fontSize: 12, color: '#A8A8A8' },

    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    callBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#457B9D',
        borderRadius: 14,
        paddingVertical: 15,
    },
    callBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    bookBtn: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#E63946',
        borderRadius: 14,
        paddingVertical: 15,
    },
    bookBtnDisabled: { backgroundColor: '#F5A0A5' },
    bookBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});