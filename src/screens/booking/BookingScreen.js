import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { createBooking } from '../../services/bookingService';

const TIME_SLOTS = [
    '08:00 AM',
    '10:00 AM',
    '12:00 PM',
    '02:00 PM',
    '04:00 PM',
    '06:00 PM',
];

function getNext7Days() {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const iso = d.toISOString().split('T')[0];
        let label;
        if (i === 0) {
            label = 'Today';
        } else if (i === 1) {
            label = 'Tomorrow';
        } else {
            label = d.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
        }
        days.push({ iso, label });
    }
    return days;
}

export default function BookingScreen({ route, navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);

    const provider = route && route.params && route.params.provider;

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    if (!provider) {
        return (
            <View style={styles.errorScreen}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorTitle}>Something went wrong</Text>
                <Text style={styles.errorSub}>Provider info is missing.</Text>
                <TouchableOpacity
                    style={styles.errorBtn}
                    onPress={function () { navigation.goBack(); }}
                >
                    <Text style={styles.errorBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    async function handleBook() {
        if (!selectedDate) {
            Alert.alert('Select Date', 'Please select a date for your booking.');
            return;
        }
        if (!selectedTime) {
            Alert.alert('Select Time', 'Please select a time slot.');
            return;
        }

        setLoading(true);
        const result = await createBooking({
            userId: user.uid,
            providerId: provider.id,
            providerName: provider.name,
            providerPhone: provider.phone || '',
            serviceType: provider.serviceType,
            date: selectedDate,
            timeSlot: selectedTime,
            notes: notes.trim(),
            ratePerHour: provider.ratePerHour,
        });
        setLoading(false);

        if (result.success) {
            Alert.alert(
                'Booking Confirmed!',
                'Your booking has been placed successfully.',
                [
                    {
                        text: 'Pay Now via eSewa',
                        onPress: function () {
                            navigation.replace('Payment', {
                                bookingId: result.bookingId,
                                provider: provider,
                                amount: provider.ratePerHour,
                            });
                        },
                    },
                    {
                        text: 'Pay Later',
                        onPress: function () {
                            navigation.navigate('Home');
                        },
                    },
                ]
            );
        } else {
            Alert.alert('Booking Failed', result.error || 'Please try again.');
        }
    }

    const days = getNext7Days();

    return (
        <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="light-content" backgroundColor="#E63946" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Provider Card */}
                <View style={styles.providerCard}>
                    <View
                        style={[
                            styles.providerAvatar,
                            provider.serviceType === 'electrician'
                                ? styles.avEl
                                : styles.avPl,
                        ]}
                    >
                        <Text style={{ fontSize: 28 }}>
                            {provider.serviceType === 'electrician' ? '⚡' : '🔧'}
                        </Text>
                    </View>
                    <View style={styles.providerInfo}>
                        <Text style={styles.providerName}>{provider.name}</Text>
                        <Text style={styles.providerType}>
                            {provider.serviceType === 'electrician'
                                ? 'Electrician'
                                : 'Plumber'}
                            {provider.experience
                                ? ' · ' + provider.experience + ' yrs exp'
                                : ''}
                        </Text>
                        <Text style={styles.providerRate}>
                            Rs. {provider.ratePerHour}/hr
                        </Text>
                    </View>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#F4A261" />
                        <Text style={styles.ratingText}>
                            {provider.rating ? provider.rating.toFixed(1) : 'New'}
                        </Text>
                    </View>
                </View>

                {/* Select Date */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Date</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
                    >
                        {days.map(function (day) {
                            return (
                                <TouchableOpacity
                                    key={day.iso}
                                    style={[
                                        styles.dateChip,
                                        selectedDate === day.iso && styles.dateChipActive,
                                    ]}
                                    onPress={function () { setSelectedDate(day.iso); }}
                                    activeOpacity={0.75}
                                >
                                    <Text
                                        style={[
                                            styles.dateChipText,
                                            selectedDate === day.iso && styles.dateChipTextActive,
                                        ]}
                                    >
                                        {day.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Select Time */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Time Slot</Text>
                    <View style={styles.timeGrid}>
                        {TIME_SLOTS.map(function (slot) {
                            return (
                                <TouchableOpacity
                                    key={slot}
                                    style={[
                                        styles.timeChip,
                                        selectedTime === slot && styles.timeChipActive,
                                    ]}
                                    onPress={function () { setSelectedTime(slot); }}
                                    activeOpacity={0.75}
                                >
                                    <Ionicons
                                        name="time-outline"
                                        size={13}
                                        color={selectedTime === slot ? '#fff' : '#6B6B6B'}
                                    />
                                    <Text
                                        style={[
                                            styles.timeChipText,
                                            selectedTime === slot && styles.timeChipTextActive,
                                        ]}
                                    >
                                        {slot}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Notes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Describe the Issue (optional)
                    </Text>
                    <TextInput
                        style={styles.notesInput}
                        placeholder="e.g. Main switch not working, pipe leaking under sink..."
                        placeholderTextColor="#A8A8A8"
                        multiline
                        numberOfLines={4}
                        value={notes}
                        onChangeText={setNotes}
                        textAlignVertical="top"
                    />
                </View>

                {/* Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Booking Summary</Text>
                    {[
                        { label: 'Provider', value: provider.name },
                        { label: 'Service', value: provider.serviceType },
                        { label: 'Date', value: selectedDate || 'Not selected' },
                        { label: 'Time', value: selectedTime || 'Not selected' },
                        { label: 'Rate', value: 'Rs. ' + provider.ratePerHour + '/hr' },
                        { label: 'Payment', value: 'Pay after service (eSewa)' },
                    ].map(function (row, i, arr) {
                        return (
                            <View
                                key={i}
                                style={[
                                    styles.summaryRow,
                                    i < arr.length - 1 && styles.summaryRowBorder,
                                ]}
                            >
                                <Text style={styles.summaryLabel}>{row.label}</Text>
                                <Text style={styles.summaryValue}>{row.value}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                    style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
                    onPress={handleBook}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.confirmBtnText}>
                        {loading ? 'Placing Booking...' : 'Confirm Booking'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F1FAEE' },

    errorScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1FAEE',
        padding: 24,
    },
    errorIcon: { fontSize: 44, marginBottom: 12 },
    errorTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1D',
        marginBottom: 6,
    },
    errorSub: { fontSize: 14, color: '#A8A8A8', marginBottom: 20 },
    errorBtn: {
        backgroundColor: '#E63946',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    errorBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    providerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 14,
        padding: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        elevation: 2,
    },
    providerAvatar: {
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    avEl: { backgroundColor: '#FFF0F1' },
    avPl: { backgroundColor: '#EBF4F9' },
    providerInfo: { flex: 1 },
    providerName: { fontSize: 14, fontWeight: '700', color: '#1D1D1D' },
    providerType: {
        fontSize: 12,
        color: '#6B6B6B',
        marginTop: 2,
        textTransform: 'capitalize',
    },
    providerRate: {
        fontSize: 13,
        fontWeight: '700',
        color: '#457B9D',
        marginTop: 4,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#FDF4E7',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    ratingText: { fontSize: 12, fontWeight: '700', color: '#BA7517' },

    section: { marginBottom: 20 },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1D1D1D',
        marginBottom: 12,
        paddingHorizontal: 16,
    },

    dateChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    dateChipActive: { backgroundColor: '#E63946', borderColor: '#E63946' },
    dateChipText: { fontSize: 12, color: '#6B6B6B', fontWeight: '500' },
    dateChipTextActive: { color: '#fff', fontWeight: '700' },

    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 10,
    },
    timeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        width: '30%',
        paddingVertical: 10,
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    timeChipActive: { backgroundColor: '#E63946', borderColor: '#E63946' },
    timeChipText: { fontSize: 11, color: '#6B6B6B', fontWeight: '500' },
    timeChipTextActive: { color: '#fff', fontWeight: '700' },

    notesInput: {
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        fontSize: 13,
        color: '#1D1D1D',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        minHeight: 90,
    },

    summaryCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    summaryTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#A8A8A8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    summaryRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B6B6B',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    summaryValue: {
        fontSize: 12,
        color: '#1D1D1D',
        fontWeight: '700',
        textTransform: 'capitalize',
        maxWidth: '55%',
        textAlign: 'right',
    },

    confirmBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#E63946',
        marginHorizontal: 16,
        borderRadius: 14,
        paddingVertical: 16,
        elevation: 4,
    },
    confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});