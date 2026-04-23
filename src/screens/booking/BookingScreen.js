import React, { useState, useContext } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { createBooking } from '../../services/bookingService';
import { AuthContext } from '../../contexts/AuthContext';
import { COLORS } from '../../constants/colors';
import { globalStyles } from '../../styles/globalStyles';

const TIME_SLOTS = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];

export default function BookingScreen({ route, navigation }) {
    const { provider } = route.params;
    const { user } = useContext(AuthContext);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    const handleBook = async () => {
        if (!selectedDate || !selectedTime) {
            Alert.alert('Error', 'Please select a date and time slot.');
            return;
        }
        setLoading(true);
        const result = await createBooking({
            userId: user.uid,
            providerId: provider.id,
            providerName: provider.name,
            serviceType: provider.serviceType,
            date: selectedDate,
            timeSlot: selectedTime,
            notes,
            ratePerHour: provider.ratePerHour,
        });
        setLoading(false);

        if (result.success) {
            Alert.alert('Booking Confirmed! 🎉', `Your booking for ${selectedDate} at ${selectedTime} is placed.`, [
                {
                    text: 'Pay Now',
                    onPress: () => navigation.navigate('Payment', {
                        bookingId: result.bookingId,
                        provider,
                        amount: provider.ratePerHour,
                    }),
                },
                { text: 'Pay Later', onPress: () => navigation.navigate('Home') },
            ]);
        } else {
            Alert.alert('Error', result.error);
        }
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <Calendar
                minDate={today}
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={{ [selectedDate]: { selected: true, selectedColor: COLORS.primary } }}
                theme={{ todayTextColor: COLORS.primary, arrowColor: COLORS.primary }}
            />

            <Text style={styles.sectionTitle}>Select Time Slot</Text>
            <View style={styles.timeGrid}>
                {TIME_SLOTS.map(slot => (
                    <TouchableOpacity
                        key={slot}
                        style={[styles.timeSlot, selectedTime === slot && styles.timeSlotActive]}
                        onPress={() => setSelectedTime(slot)}
                    >
                        <Text style={[styles.timeSlotText, selectedTime === slot && { color: '#fff' }]}>{slot}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Notes (optional)</Text>
            <TextInput
                style={[globalStyles.inputField, { marginHorizontal: 16, height: 80 }]}
                placeholder="Describe the issue briefly..."
                multiline
                value={notes}
                onChangeText={setNotes}
            />

            <View style={{ margin: 16 }}>
                <Text style={styles.summary}>Provider: {provider.name}</Text>
                <Text style={styles.summary}>Rate: Rs. {provider.ratePerHour}/hr</Text>
                {selectedDate && <Text style={styles.summary}>Date: {selectedDate}</Text>}
                {selectedTime && <Text style={styles.summary}>Time: {selectedTime}</Text>}
            </View>

            <TouchableOpacity
                style={[globalStyles.primaryButton, { marginHorizontal: 16 }, loading && { opacity: 0.7 }]}
                onPress={handleBook}
                disabled={loading}
            >
                <Text style={globalStyles.primaryButtonText}>{loading ? 'Booking...' : 'Confirm Booking'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, margin: 16, marginBottom: 8 },
    timeGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
    timeSlot: {
        borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8,
        paddingHorizontal: 14, paddingVertical: 10,
    },
    timeSlotActive: { backgroundColor: COLORS.primary },
    timeSlotText: { color: COLORS.primary, fontWeight: '600' },
    summary: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 4 },
});