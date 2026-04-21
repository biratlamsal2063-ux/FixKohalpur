import React, { useState } from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { generateEsewaPaymentHTML } from '../../services/esewaService';
import { updateBookingStatus } from '../../services/bookingService';
import { CONFIG } from '../../constants/config';
import { COLORS } from '../../constants/colors';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

export default function PaymentScreen({ route, navigation }) {
    const { bookingId, provider, amount } = route.params;
    const [loading, setLoading] = useState(true);

    const txnId = `FK-${bookingId}-${Date.now()}`;
    const paymentHTML = generateEsewaPaymentHTML({
        amount,
        txnId,
        productName: `${provider.serviceType} service`,
    });

    const handleNavigationChange = async (navState) => {
        const { url } = navState;

        if (url.startsWith(CONFIG.ESEWA_SUCCESS_URL)) {
            // Payment successful
            try {
                await updateDoc(doc(db, 'bookings', bookingId), {
                    paymentStatus: 'paid',
                    txnId,
                    paidAt: new Date().toISOString(),
                });
                Alert.alert('Payment Successful! 🎉', 'Your booking is confirmed and paid.', [
                    { text: 'Leave a Review', onPress: () => navigation.replace('Review', { bookingId, provider }) },
                    { text: 'Go Home', onPress: () => navigation.navigate('Home') },
                ]);
            } catch (e) {
                Alert.alert('Payment recorded but update failed. Contact support.');
                navigation.navigate('Home');
            }
        }

        if (url.startsWith(CONFIG.ESEWA_FAILURE_URL)) {
            Alert.alert('Payment Failed', 'Your payment could not be processed. Please try again.', [
                { text: 'Retry', onPress: () => navigation.goBack() },
                { text: 'Pay Later', onPress: () => navigation.navigate('Home') },
            ]);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>Opening eSewa...</Text>
                </View>
            )}
            <WebView
                originWhitelist={['*']}
                source={{ html: paymentHTML }}
                onNavigationStateChange={handleNavigationChange}
                onLoadEnd={() => setLoading(false)}
                javaScriptEnabled
            />
        </View>
    );
}

const styles = StyleSheet.create({
    loadingOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: COLORS.background, zIndex: 10,
    },
});