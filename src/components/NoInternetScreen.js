import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export default function NoInternetScreen({ onRetry }) {
    return (
        <View style={styles.screen}>
            <Text style={styles.icon}>📡</Text>
            <Text style={styles.title}>No Internet Connection</Text>
            <Text style={styles.sub}>
                Fix Kohalpur needs internet to work.{'\n'}
                Please check your connection and try again.
            </Text>
            <TouchableOpacity style={styles.btn} onPress={onRetry}>
                <Text style={styles.btnText}>Try Again</Text>
            </TouchableOpacity>
        </View>
    );
}

var styles = StyleSheet.create({
    screen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1FAEE', padding: 32 },
    icon: { fontSize: 56, marginBottom: 16 },
    title: { fontSize: 18, fontWeight: '700', color: '#1D1D1D', marginBottom: 10, textAlign: 'center' },
    sub: { fontSize: 14, color: '#6B6B6B', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
    btn: { backgroundColor: '#E63946', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14 },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});