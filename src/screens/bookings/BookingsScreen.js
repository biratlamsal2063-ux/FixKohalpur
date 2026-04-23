import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    collection, query, where, onSnapshot,
    orderBy, doc, updateDoc,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase/firebaseConfig';
import { AuthContext } from '../../contexts/AuthContext';

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Done' },
    { key: 'cancelled', label: 'Cancelled' },
];

const RED_STATUS = { bg: '#FCEBEB', text: '#A32D2D' };
const GREEN_STATUS = { bg: '#E1F5EE', text: '#0F6E56' };
const BLUE_STATUS = { bg: '#EBF4F9', text: '#185FA5' };
const AMBER_STATUS = { bg: '#FDF4E7', text: '#BA7517' };

const STATUS_COLORS = {
    pending: AMBER_STATUS,
    assigned: GREEN_STATUS,
    confirmed: GREEN_STATUS,
    started: BLUE_STATUS,
    completed: BLUE_STATUS,
    cancelled: RED_STATUS,
};

export default function BookingsScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'bookings'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
        const unsub = onSnapshot(q, snap => {
            setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return unsub;
    }, [user]);

    const filtered = bookings.filter(b => {
        if (activeTab === 'all') return true;
        if (activeTab === 'active') return ['pending', 'confirmed', 'assigned', 'started'].includes(b.status);
        if (activeTab === 'completed') return b.status === 'completed';
        if (activeTab === 'cancelled') return b.status === 'cancelled';
        return true;
    });

    const stats = {
        total: bookings.length,
        active: bookings.filter(b => ['pending', 'confirmed', 'assigned', 'started'].includes(b.status)).length,
        completed: bookings.filter(b => b.status === 'completed').length,
    };

    const handleCancel = (bookingId) => {
        Alert.alert('Cancel Booking', 'Are you sure you want to cancel?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Yes, Cancel', style: 'destructive',
                onPress: async () => {
                    try {
                        await updateDoc(doc(db, 'bookings', bookingId), { status: 'cancelled' });
                    } catch (e) {
                        Alert.alert('Error', 'Could not cancel. Please try again.');
                    }
                },
            },
        ]);
    };

    const renderActions = (item) => {
        const isPending = item.status === 'pending';
        const isActive = ['confirmed', 'assigned', 'started'].includes(item.status);
        const isDone = item.status === 'completed';
        const isCancelled = item.status === 'cancelled';

        return (
            <View style={styles.actions}>
                {isPending && (
                    <>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => handleCancel(item.id)}
                        >
                            <Text style={styles.actionGray}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.actionBorderLeft]}
                            onPress={() => navigation.navigate('TrackService', { booking: item })}
                        >
                            <Ionicons name="navigate-outline" size={13} color="#185FA5" />
                            <Text style={styles.actionBlue}>Track</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.actionBorderLeft]}
                            onPress={() => navigation.navigate('Chat', { booking: item })}
                        >
                            <Ionicons name="chatbubble-outline" size={13} color="#E63946" />
                            <Text style={styles.actionRed}>Message</Text>
                        </TouchableOpacity>
                    </>
                )}

                {isActive && (
                    <>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('TrackService', { booking: item })}
                        >
                            <Ionicons name="navigate-outline" size={13} color="#185FA5" />
                            <Text style={styles.actionBlue}>Track</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.actionBorderLeft]}
                            onPress={() => navigation.navigate('Chat', { booking: item })}
                        >
                            <Ionicons name="chatbubble-outline" size={13} color="#E63946" />
                            <Text style={styles.actionRed}>Message</Text>
                        </TouchableOpacity>
                    </>
                )}

                {isDone && item.paymentStatus === 'unpaid' && (
                    <>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('Payment', {
                                bookingId: item.id,
                                provider: {
                                    id: item.providerId,
                                    name: item.providerName,
                                    serviceType: item.serviceType,
                                },
                                amount: item.ratePerHour,
                            })}
                        >
                            <Ionicons name="card-outline" size={13} color="#E63946" />
                            <Text style={styles.actionRed}>Pay Now</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.actionBorderLeft]}
                            onPress={() => navigation.navigate('Review', {
                                bookingId: item.id,
                                provider: { id: item.providerId, name: item.providerName },
                            })}
                        >
                            <Ionicons name="star-outline" size={13} color="#185FA5" />
                            <Text style={styles.actionBlue}>Review</Text>
                        </TouchableOpacity>
                    </>
                )}

                {isDone && item.paymentStatus === 'paid' && (
                    <>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('HomeTab')}
                        >
                            <Ionicons name="refresh-outline" size={13} color="#185FA5" />
                            <Text style={styles.actionBlue}>Book Again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.actionBorderLeft]}
                            onPress={() => Alert.alert(
                                'Receipt',
                                `Booking #${item.id.slice(0, 8).toUpperCase()}\nAmount: Rs.${item.ratePerHour}\nStatus: Paid`
                            )}
                        >
                            <Ionicons name="receipt-outline" size={13} color="#A8A8A8" />
                            <Text style={styles.actionGray}>Receipt</Text>
                        </TouchableOpacity>
                    </>
                )}

                {isCancelled && (
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('HomeTab')}
                    >
                        <Ionicons name="add-circle-outline" size={13} color="#E63946" />
                        <Text style={styles.actionRed}>Book Again</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderCard = ({ item }) => {
        const isElec = item.serviceType === 'electrician';
        const sc = STATUS_COLORS[item.status] || AMBER_STATUS;

        return (
            <View style={styles.card}>
                <View style={styles.cardTop}>
                    <View style={[styles.avatar, isElec ? styles.avEl : styles.avPl]}>
                        <Text style={{ fontSize: 22 }}>{isElec ? '⚡' : '🔧'}</Text>
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardName}>{item.providerName}</Text>
                        <Text style={styles.cardService} numberOfLines={1}>
                            {item.notes || (isElec ? 'Electrical service' : 'Plumbing service')}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                        <Text style={[styles.statusText, { color: sc.text }]}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.metaRow}>
                    {[
                        { label: 'Date', value: item.date || '—' },
                        { label: 'Time', value: item.timeSlot || '—' },
                        { label: 'Rate', value: `Rs.${item.ratePerHour}/hr` },
                        {
                            label: 'Payment',
                            value: (item.paymentStatus || 'unpaid').charAt(0).toUpperCase() +
                                (item.paymentStatus || 'unpaid').slice(1),
                            color: item.paymentStatus === 'paid' ? '#0F6E56' : '#E63946',
                        },
                    ].map((m, i) => (
                        <View key={i} style={[styles.meta, i > 0 && styles.metaBorder]}>
                            <Text style={styles.metaLabel}>{m.label}</Text>
                            <Text style={[styles.metaValue, m.color && { color: m.color }]}>
                                {m.value}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.divider} />
                {renderActions(item)}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator size="large" color="#E63946" />
                <Text style={styles.loadingText}>Loading your bookings...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="light-content" backgroundColor="#E63946" />

            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>My Bookings</Text>
                    <View style={styles.headerBadge}>
                        <Text style={styles.headerBadgeText}>{bookings.length} total</Text>
                    </View>
                </View>

                <View style={styles.tabRow}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            style={styles.tabItem}
                            onPress={() => setActiveTab(tab.key)}
                            activeOpacity={0.75}
                        >
                            <Text style={[
                                styles.tabLabel,
                                activeTab === tab.key && styles.tabLabelActive,
                            ]}>
                                {tab.label}
                            </Text>
                            {activeTab === tab.key && <View style={styles.tabUnderline} />}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View style={styles.statsRow}>
                        {[
                            { val: stats.total, label: 'Total', color: '#1D1D1D' },
                            { val: stats.active, label: 'Active', color: '#E63946' },
                            { val: stats.completed, label: 'Completed', color: '#0F6E56' },
                        ].map((s, i) => (
                            <View key={i} style={styles.statCard}>
                                <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
                                <Text style={styles.statLabel}>{s.label}</Text>
                            </View>
                        ))}
                    </View>
                )}
                renderItem={renderCard}
                ListEmptyComponent={() => (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyIcon}>📅</Text>
                        <Text style={styles.emptyTitle}>No bookings here</Text>
                        <Text style={styles.emptySub}>
                            {activeTab === 'all'
                                ? 'Book a service from the Home screen to get started'
                                : `No ${activeTab} bookings found`}
                        </Text>
                        {activeTab === 'all' && (
                            <TouchableOpacity
                                style={styles.emptyBtn}
                                onPress={() => navigation.navigate('HomeTab')}
                            >
                                <Text style={styles.emptyBtnText}>Browse Services</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F1FAEE' },
    loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1FAEE' },
    loadingText: { color: '#6B6B6B', marginTop: 12, fontSize: 14 },

    header: {
        backgroundColor: '#E63946',
        paddingHorizontal: 20,
        paddingBottom: 0,
    },
    headerRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 14,
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
    headerBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    headerBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },

    tabRow: { flexDirection: 'row' },
    tabItem: { flex: 1, alignItems: 'center', paddingVertical: 10, position: 'relative' },
    tabLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
    tabLabelActive: { color: '#fff' },
    tabUnderline: {
        position: 'absolute', bottom: 0,
        left: '10%', width: '80%',
        height: 2, backgroundColor: '#fff', borderRadius: 1,
    },

    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    statCard: {
        flex: 1, backgroundColor: '#fff', borderRadius: 12,
        borderWidth: 1, borderColor: '#EEEEEE',
        padding: 12, alignItems: 'center',
    },
    statVal: { fontSize: 22, fontWeight: '700' },
    statLabel: { fontSize: 10, color: '#A8A8A8', marginTop: 2, fontWeight: '500' },

    card: {
        backgroundColor: '#fff', borderRadius: 14,
        borderWidth: 1, borderColor: '#EEEEEE',
        marginBottom: 12, overflow: 'hidden',
    },
    cardTop: {
        flexDirection: 'row', alignItems: 'center',
        padding: 13, gap: 10,
    },
    avatar: {
        width: 48, height: 48, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', flexShrink: 0,
    },
    avEl: { backgroundColor: '#FFF0F1' },
    avPl: { backgroundColor: '#EBF4F9' },
    cardInfo: { flex: 1, minWidth: 0 },
    cardName: { fontSize: 13, fontWeight: '700', color: '#1D1D1D' },
    cardService: { fontSize: 11, color: '#6B6B6B', marginTop: 2 },
    statusBadge: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4, alignSelf: 'flex-start' },
    statusText: { fontSize: 9, fontWeight: '700' },

    divider: { height: 1, backgroundColor: '#F5F5F5' },

    metaRow: { flexDirection: 'row', padding: 10 },
    meta: { flex: 1, alignItems: 'center', gap: 2 },
    metaBorder: { borderLeftWidth: 1, borderLeftColor: '#F5F5F5' },
    metaLabel: { fontSize: 9, color: '#A8A8A8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
    metaValue: { fontSize: 11, color: '#1D1D1D', fontWeight: '700' },

    actions: { flexDirection: 'row' },
    actionBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 4, paddingVertical: 11,
    },
    actionBorderLeft: { borderLeftWidth: 1, borderLeftColor: '#F5F5F5' },
    actionRed: { fontSize: 11, fontWeight: '700', color: '#E63946' },
    actionBlue: { fontSize: 11, fontWeight: '700', color: '#185FA5' },
    actionGray: { fontSize: 11, fontWeight: '700', color: '#A8A8A8' },

    emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
    emptyIcon: { fontSize: 44, marginBottom: 14 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1D1D1D', marginBottom: 8 },
    emptySub: { fontSize: 13, color: '#A8A8A8', textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
    emptyBtn: {
        marginTop: 20, backgroundColor: '#E63946',
        borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12,
    },
    emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});