import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet, Text } from 'react-native';

export default function LoadingSpinner() {
    var pulse = useRef(new Animated.Value(1)).current;

    useEffect(function () {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.08, duration: 800, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.screen}>
            <Animated.Image
                source={require('../../assets/icon.png')}
                style={[styles.logo, { transform: [{ scale: pulse }] }]}
                resizeMode="contain"
            />
            <Text style={styles.name}>Fix Kohalpur</Text>
            <Text style={styles.tag}>Services at your doorstep</Text>
        </View>
    );
}

var styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        gap: 12,
    },
    logo: { width: 120, height: 120 },
    name: { fontSize: 22, fontWeight: '700', color: '#1D1D1D', letterSpacing: -0.3 },
    tag: { fontSize: 13, color: '#6B6B6B' },
});