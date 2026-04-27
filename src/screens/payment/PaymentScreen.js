import React, { useState, useEffect } from 'react';
import {
    View, Text, ActivityIndicator,
    StyleSheet, Alert, TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { generateEsewaPaymentHTML } from '../../services/esewaService';

export default function PaymentScreen(props) {
    var route = props.route;
    var navigation = props.navigation;
    var insets = useSafeAreaInsets();

    var booking = route && route.params ? route.params : {};
    var bookingId = booking.bookingId;
    var provider = booking.provider || {};
    var amount = booking.amount || 0;

    var htmlState = useState(null);
    var html = htmlState[0];
    var setHtml = htmlState[1];

    var loadState = useState(true);
    var loading = loadState[0];
    var setLoading = loadState[1];

    var errorState = useState(null);
    var error = errorState[0];
    var setError = errorState[1];

    var txnId = 'FK-' + bookingId + '-' + Date.now();

    // Success and failure URLs must match what you put in eSewa dashboard
    var SUCCESS_URL = 'https://fixkohalpur.com/payment/success';
    var FAILURE_URL = 'https://fixkohalpur.com/payment/failure';

    useEffect(function () {
        loadPaymentForm();
    }, []);

    async function loadPaymentForm() {
        setLoading(true);
        setError(null);
        var result = await generateEsewaPaymentHTML(amount, txnId);
        if (result.success) {
            setHtml(result.html);
        } else {
            setError(result.error || 'Could not load payment form.');
        }
        setLoading(false);
    }

    function handleNavigationChange(navState) {
        var url = navState.url;

        if (url && url.startsWith(SUCCESS_URL)) {
            // Payment redirected to success URL
            // Extract encoded response from URL if present
            var encodedResponse = '';
            if (url.includes('data=')) {
                encodedResponse = url.split('data=')[1];
            }

            Alert.alert(
                'Payment Successful!',
                'Your booking is confirmed and paid.',
                [
                    {
                        text: 'Leave a Review',
                        onPress: function () {
                            navigation.replace('Review', {
                                bookingId: bookingId,
                                provider: provider,
                            });
                        },
                    },
                    {
                        text: 'Go Home',
                        onPress: function () { navigation.navigate('HomeTab'); },
                    },
                ]
            );
        }

        if (url && url.startsWith(FAILURE_URL)) {
            Alert.alert(
                'Payment Failed',
                'Your payment could not be processed.',
                [
                    { text: 'Try Again', onPress: loadPaymentForm },
                    { text: 'Pay Later', onPress: function () { navigation.navigate('HomeTab'); } },
                ]
            );
        }
    }

    // Loading state
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#E63946" />
                <Text style={styles.loadingText}>Preparing payment...</Text>
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorTitle}>Payment Unavailable</Text>
                <Text style={styles.errorSub}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={loadPaymentForm}>
                    <Text style={styles.retryBtnText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={function () { navigation.goBack(); }}>
                    <Text style={styles.goBack}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
            <WebView
                originWhitelist={['*']}
                source={{ html: html }}
                onNavigationStateChange={handleNavigationChange}
                javaScriptEnabled={true}
                startInLoadingState={true}
                renderLoading={function () {
                    return (
                        <View style={styles.center}>
                            <ActivityIndicator size="large" color="#E63946" />
                            <Text style={styles.loadingText}>Opening eSewa...</Text>
                        </View>
                    );
                }}
            />
        </View>
    );
}

var styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F1FAEE' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1FAEE', padding: 24 },
    loadingText: { color: '#6B6B6B', marginTop: 12, fontSize: 14 },
    errorIcon: { fontSize: 44, marginBottom: 12 },
    errorTitle: { fontSize: 17, fontWeight: '700', color: '#1D1D1D', marginBottom: 8 },
    errorSub: { fontSize: 13, color: '#A8A8A8', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    retryBtn: { backgroundColor: '#E63946', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginBottom: 12 },
    retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    goBack: { color: '#A8A8A8', fontSize: 13 },
});