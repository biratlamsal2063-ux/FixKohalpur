import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView,
    StyleSheet, StatusBar, Linking, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase/firebaseConfig';

const STEPS = [
    { key: 'pending', label: 'Booking Confirmed', icon: 'checkmark-circle-outline' },
    { key: 'assigned', label: 'Technician Assigned', icon: 'person-outline' },
    { key: 'confirmed', label: 'On the Way', icon: 'navigate-outline' },
    { key: 'started', label: 'Work Started', icon: 'construct-outline' },
    { key: 'completed', label: 'Completed & Pay', icon: 'card-outline' },
];

const STATUS_ORDER = ['pending', 'assigned', 'confirmed', 'started', 'completed'];

export default function TrackServiceScreen({ route, navigation }) {
    const insets = useSafeAreaInsets();
    const { booking: initialBooking } = route.params;
    const [booking, setBooking] = useState(initialBooking);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'bookings', initialBooking.id), (snap) => {
            if (snap.exists()) setBooking({ id: snap.id, ...snap.data() });
        });
        return unsub;
    }, [initialBooking.id]);

    const currentStepIndex = STATUS_ORDER.indexOf(booking.status);

    const getStepState = (index) => {
        if (index < currentStepIndex) return 'done';
        if (index === currentStepIndex) return 'active';
        return 'pending';
    };

    const handleCall = () => {
        if (!booking.providerPhone) {
            Alert.alert('Not available', 'Provider phone number is not available.');
            return;
        }
        Linking.openURL(`tel:${booking.providerPhone}`);
    };

    const handleCancel = () => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel', style: 'destructive',
                    onPress: async () => {
                        try {
                            await updateDoc(doc(db, 'bookings', booking.id), { status: 'cancelled' });
                            navigation.goBack();
                        } catch (e) {
                            Alert.alert('Error', 'Could not cancel booking. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="light-content" backgroundColor="#E63946" />

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Map placeholder */}
                <View style={styles.mapBox}>
                    <View style={styles.mapBg} />
                    <View style={[styles.road, styles.roadH, { top: '40%' }]} />
                    <View style={[styles.road, styles.roadH, { top: '65%' }]} />
                    <View style={[styles.road, styles.roadV, { left: '30%' }]} />
                    <View style={[styles.road, styles.roadV, { left: '65%' }]} />
                    <Text style={[styles.mapPin, { bottom: 20, right: 30 }]}>📍</Text>
                    <View style={[styles.techDot, { left: '22%', top: '32%' }]}>
                        <Text style={{ fontSize: 13 }}>
                            {booking.serviceType === 'electrician' ? '⚡' : '🔧'}
                        </Text>
                    </View>
                    <View style={styles.etaBadge}>
                        <Ionicons name="time-outline" size={12} color="#E63946" />
                        <Text style={styles.etaText}>ETA ~12 min</Text>
                    </View>
                </View>

                <View style={styles.body}>

                    {/* Technician card */}
                    <View style={styles.techCard}>
                        <View style={[
                            styles.techAvatar,
                            booking.serviceType === 'electrician' ? styles.avEl : styles.avPl,
                        ]}>
                            <Text style={{ fontSize: 24 }}>
                                {booking.serviceType === 'electrician' ? '⚡' : '🔧'}
                            </Text>
                        </View>
                        <View style={styles.techInfo}>
                            <Text style={styles.techName}>{booking.providerName}</Text>
                            <Text style={styles.techType}>
                                {booking.serviceType} · #{booking.id.slice(0, 8).toUpperCase()}
                            </Text>
                            <Text style={styles.techRating}>★ 4.9 · Verified Pro</Text>
                        </View>
                        <View style={styles.techActions}>
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => navigation.navigate('Chat', { booking })}
                            >
                                <Ionicons name="chatbubble-outline" size={18} color="#E63946" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
                                <Ionicons name="call-outline" size={18} color="#457B9D" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Progress steps */}
                    <View style={styles.stepsCard}>
                        <Text style={styles.stepsTitle}>Service Progress</Text>
                        {STEPS.map((step, index) => {
                            const state = getStepState(index);
                            const isLast = index === STEPS.length - 1;
                            return (
                                <View key={step.key} style={styles.stepRow}>
                                    <View style={styles.stepLeft}>
                                        <View style={[
                                            styles.stepDot,
                                            state === 'done' && styles.stepDotDone,
                                            state === 'active' && styles.stepDotActive,
                                            state === 'pending' && styles.stepDotPending,
                                        ]}>
                                            {state === 'done' ? (
                                                <Ionicons name="checkmark" size={12} color="#0F6E56" />
                                            ) : state === 'active' ? (
                                                <View style={styles.activePulse} />
                                            ) : null}
                                        </View>
                                        {!isLast && (
                                            <View style={[
                                                styles.stepLine,
                                                state === 'done' ? styles.stepLineDone : styles.stepLinePending,
                                            ]} />
                                        )}
                                    </View>
                                    <View style={styles.stepBody}>
                                        <Text style={[
                                            styles.stepLabel,
                                            state === 'active' && styles.stepLabelActive,
                                            state === 'pending' && styles.stepLabelPending,
                                        ]}>
                                            {step.label}
                                        </Text>
                                        <Text style={styles.stepSub}>
                                            {state === 'done' ? 'Completed' :
                                                state === 'active' ? 'In progress...' : 'Waiting'}
                                        </Text>
                                    </View>
                                    {state === 'active' && (
                                        <View style={styles.activeBadge}>
                                            <Text style={styles.activeBadgeText}>Now</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    {/* Booking details */}
                    <View style={styles.detailCard}>
                        <Text style={styles.detailTitle}>Booking Details</Text>
                        {[
                            { label: 'Service', value: booking.serviceType },
                            { label: 'Date', value: booking.date },
                            { label: 'Time', value: booking.timeSlot },
                            { label: 'Rate', value: `Rs. ${booking.ratePerHour}/hr` },
                            { label: 'Payment', value: booking.paymentStatus },
                            { label: 'Status', value: booking.status, accent: true },
                        ].map((row, i, arr) => (
                            <View key={i} style={[
                                styles.detailRow,
                                i < arr.length - 1 && styles.detailRowBorder,
                            ]}>
                                <Text style={styles.detailLabel}>{row.label}</Text>
                                <Text style={[styles.detailValue, row.accent && { color: '#E63946' }]}>
                                    {row.value}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Pay button */}
                    {booking.status === 'completed' && booking.paymentStatus === 'unpaid' && (
                        <TouchableOpacity
                            style={styles.payBtn}
                            onPress={() => navigation.navigate('Payment', {
                                bookingId: booking.id,
                                provider: {
                                    id: booking.providerId,
                                    name: booking.providerName,
                                    serviceType: booking.serviceType,
                                },
                                amount: booking.ratePerHour,
                            })}
                        >
                            <Ionicons name="card-outline" size={18} color="#fff" />
                            <Text style={styles.payBtnText}>Pay via eSewa</Text>
                        </TouchableOpacity>
                    )}

                    {/* Cancel button */}
                    {['pending', 'assigned'].includes(booking.status) && (
                        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                        </TouchableOpacity>
                    )}

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F1FAEE' },

    mapBox: { height: 180, position: 'relative', overflow: 'hidden' },
    mapBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#D4EBF0' },
    road: { position: 'absolute', backgroundColor: '#fff' },
    roadH: { height: 2, width: '100%' },
    roadV: { width: 2, height: '100%' },
    mapPin: { position: 'absolute', fontSize: 24 },
    techDot: {
        position: 'absolute', width: 32, height: 32,
        backgroundColor: '#E63946', borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#fff',
    },
    etaBadge: {
        position: 'absolute', top: 12, right: 12,
        backgroundColor: '#fff', borderRadius: 10,
        paddingHorizontal: 10, paddingVertical: 5,
        flexDirection: 'row', alignItems: 'center', gap: 4,
        borderWidth: 1, borderColor: '#EEEEEE',
    },
    etaText: { fontSize: 12, fontWeight: '700', color: '#E63946' },

    body: { padding: 16 },

    techCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 14,
        padding: 14, marginBottom: 12, gap: 12,
        borderWidth: 1, borderColor: '#EEEEEE',
    },
    techAvatar: {
        width: 52, height: 52, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', flexShrink: 0,
    },
    avEl: { backgroundColor: '#FFF0F1' },
    avPl: { backgroundColor: '#EBF4F9' },
    techInfo: { flex: 1 },
    techName: { fontSize: 14, fontWeight: '700', color: '#1D1D1D' },
    techType: { fontSize: 11, color: '#A8A8A8', marginTop: 2, textTransform: 'capitalize' },
    techRating: { fontSize: 11, color: '#BA7517', fontWeight: '600', marginTop: 4 },
    techActions: { flexDirection: 'row', gap: 8 },
    actionBtn: {
        width: 38, height: 38, borderRadius: 10,
        borderWidth: 1, borderColor: '#EEEEEE',
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#fff',
    },

    stepsCard: {
        backgroundColor: '#fff', borderRadius: 14,
        padding: 14, marginBottom: 12,
        borderWidth: 1, borderColor: '#EEEEEE',
    },
    stepsTitle: {
        fontSize: 11, fontWeight: '700', color: '#A8A8A8',
        textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14,
    },
    stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    stepLeft: { alignItems: 'center', width: 22 },
    stepDot: {
        width: 22, height: 22, borderRadius: 11,
        justifyContent: 'center', alignItems: 'center',
    },
    stepDotDone: { backgroundColor: '#E1F5EE' },
    stepDotActive: { backgroundColor: '#E63946' },
    stepDotPending: { backgroundColor: '#F0F0F0' },
    activePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
    stepLine: { width: 2, height: 24, marginVertical: 3 },
    stepLineDone: { backgroundColor: '#1D9E75' },
    stepLinePending: { backgroundColor: '#EEEEEE' },
    stepBody: { flex: 1, paddingBottom: 14 },
    stepLabel: { fontSize: 13, fontWeight: '600', color: '#1D1D1D' },
    stepLabelActive: { color: '#E63946' },
    stepLabelPending: { color: '#A8A8A8' },
    stepSub: { fontSize: 11, color: '#A8A8A8', marginTop: 2 },
    activeBadge: {
        backgroundColor: '#FFF0F1', borderRadius: 10,
        paddingHorizontal: 8, paddingVertical: 3,
    },
    activeBadgeText: { fontSize: 10, color: '#E63946', fontWeight: '700' },

    detailCard: {
        backgroundColor: '#fff', borderRadius: 14,
        padding: 14, marginBottom: 12,
        borderWidth: 1, borderColor: '#EEEEEE',
    },
    detailTitle: {
        fontSize: 11, fontWeight: '700', color: '#A8A8A8',
        textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9,
    },
    detailRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    detailLabel: { fontSize: 12, color: '#6B6B6B', fontWeight: '500', textTransform: 'capitalize' },
    detailValue: { fontSize: 12, color: '#1D1D1D', fontWeight: '700', textTransform: 'capitalize' },

    payBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#E63946', borderRadius: 14,
        paddingVertical: 15, marginBottom: 10,
    },
    payBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    cancelBtn: {
        backgroundColor: '#fff', borderRadius: 14,
        paddingVertical: 14, alignItems: 'center',
        borderWidth: 1, borderColor: '#FCEBEB', marginBottom: 4,
    },
    cancelBtnText: { color: '#E63946', fontSize: 14, fontWeight: '700' },
});