import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, StatusBar, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase/firebaseConfig';
import { AuthContext } from '../../contexts/AuthContext';

export default function MessagesScreen(props) {
    var navigation = props.navigation;
    var insets = useSafeAreaInsets();
    var authCtx = useContext(AuthContext);
    var user = authCtx.user;
    var role = authCtx.role;

    var convsState = useState([]);
    var convs = convsState[0];
    var setConvs = convsState[1];

    var loadingState = useState(true);
    var loading = loadingState[0];
    var setLoading = loadingState[1];

    useEffect(function () {
        if (!user) return;

        // Customer sees bookings where they are the user
        // Provider sees bookings where they are the provider
        var field = role === 'provider' ? 'providerId' : 'userId';

        var q = query(
            collection(db, 'bookings'),
            where(field, '==', user.uid)
        );

        var unsub = onSnapshot(q, function (snap) {
            var data = snap.docs.map(function (d) {
                return Object.assign({ id: d.id }, d.data());
            });
            // Sort newest first
            data.sort(function (a, b) {
                var at = a.lastMessageAt && a.lastMessageAt.toDate ? a.lastMessageAt.toDate() : (a.createdAt && a.createdAt.toDate ? a.createdAt.toDate() : new Date(0));
                var bt = b.lastMessageAt && b.lastMessageAt.toDate ? b.lastMessageAt.toDate() : (b.createdAt && b.createdAt.toDate ? b.createdAt.toDate() : new Date(0));
                return bt - at;
            });
            setConvs(data);
            setLoading(false);
        }, function (e) {
            console.error('MessagesScreen error:', e);
            setLoading(false);
        });

        return unsub;
    }, [user, role]);

    function formatTime(ts) {
        if (!ts) return '';
        var date = ts.toDate ? ts.toDate() : new Date(ts);
        var now = new Date();
        var diff = now - date;
        if (diff < 86400000) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return 'Yesterday';
    }

    function getStatusStyle(status) {
        if (status === 'confirmed' || status === 'assigned' || status === 'started') return { bg: '#E1F5EE', text: '#0F6E56' };
        if (status === 'completed') return { bg: '#EBF4F9', text: '#185FA5' };
        if (status === 'cancelled') return { bg: '#FCEBEB', text: '#A32D2D' };
        return { bg: '#FDF4E7', text: '#BA7517' };
    }

    function renderItem(info) {
        var item = info.item;
        var isElec = item.serviceType === 'electrician';
        var sc = getStatusStyle(item.status);
        var isActive = item.status === 'confirmed' || item.status === 'assigned' || item.status === 'started';

        // The name shown depends on role
        // Customer sees provider name, provider sees "Customer"
        var displayName = role === 'provider' ? 'Customer Request' : (item.providerName || 'Provider');

        return (
            <TouchableOpacity
                style={styles.item}
                onPress={function () { navigation.navigate('Chat', { booking: item }); }}
                activeOpacity={0.75}
            >
                <View style={[styles.avatar, isElec ? styles.avEl : styles.avPl]}>
                    <Text style={{ fontSize: 20 }}>{isElec ? '⚡' : '🔧'}</Text>
                    {isActive ? <View style={styles.onlineDot} /> : null}
                </View>

                <View style={styles.body}>
                    <Text style={styles.name}>{displayName}</Text>
                    <Text style={styles.lastMsg} numberOfLines={1}>
                        {item.lastMessage || 'Tap to open conversation'}
                    </Text>
                    <View style={styles.bkBadge}>
                        <Text style={styles.bkBadgeText}>
                            {'#' + item.id.slice(0, 6).toUpperCase() + ' · ' + item.serviceType}
                        </Text>
                    </View>
                </View>

                <View style={styles.right}>
                    <Text style={styles.time}>{formatTime(item.lastMessageAt || item.createdAt)}</Text>
                    <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
                        <Text style={[styles.statusPillText, { color: sc.text }]}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#E63946" />
            </View>
        );
    }

    return (
        <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="light-content" backgroundColor="#E63946" />

            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <Text style={styles.title}>Messages</Text>
                <Text style={styles.subtitle}>{convs.length} conversation{convs.length !== 1 ? 's' : ''}</Text>
            </View>

            <FlatList
                data={convs}
                keyExtractor={function (item) { return item.id; }}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={function () {
                    return (
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>💬</Text>
                            <Text style={styles.emptyTitle}>No messages yet</Text>
                            <Text style={styles.emptySub}>
                                {role === 'provider'
                                    ? 'Accepted bookings will appear here'
                                    : 'Book a service to start chatting'}
                            </Text>
                            {role !== 'provider' ? (
                                <TouchableOpacity
                                    style={styles.emptyBtn}
                                    onPress={function () { navigation.navigate('HomeTab'); }}
                                >
                                    <Text style={styles.emptyBtnText}>Browse Services</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    );
                }}
                contentContainerStyle={{ flexGrow: 1 }}
            />
        </View>
    );
}

var styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F1FAEE' },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1FAEE' },
    header: { backgroundColor: '#E63946', paddingHorizontal: 20, paddingBottom: 16 },
    title: { fontSize: 20, fontWeight: '700', color: '#fff' },
    subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#F0F0F0',
        gap: 12,
    },
    avatar: {
        width: 48, height: 48, borderRadius: 24,
        justifyContent: 'center', alignItems: 'center',
        position: 'relative', flexShrink: 0,
    },
    avEl: { backgroundColor: '#FFF0F1' },
    avPl: { backgroundColor: '#EBF4F9' },
    onlineDot: {
        width: 11, height: 11, backgroundColor: '#1D9E75',
        borderRadius: 6, position: 'absolute',
        bottom: 0, right: 0,
        borderWidth: 2, borderColor: '#fff',
    },
    body: { flex: 1, minWidth: 0 },
    name: { fontSize: 13, fontWeight: '700', color: '#1D1D1D', marginBottom: 2 },
    lastMsg: { fontSize: 11, color: '#6B6B6B', marginBottom: 4 },
    bkBadge: {
        backgroundColor: '#FFF0F1', borderRadius: 8,
        paddingHorizontal: 6, paddingVertical: 2,
        alignSelf: 'flex-start',
    },
    bkBadgeText: { fontSize: 9, color: '#E63946', fontWeight: '700' },

    right: { alignItems: 'flex-end', gap: 6 },
    time: { fontSize: 10, color: '#A8A8A8' },
    statusPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
    statusPillText: { fontSize: 9, fontWeight: '700', textTransform: 'capitalize' },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyIcon: { fontSize: 44, marginBottom: 14 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1D1D1D', marginBottom: 8 },
    emptySub: { fontSize: 13, color: '#A8A8A8', textAlign: 'center', lineHeight: 20 },
    emptyBtn: {
        marginTop: 20, backgroundColor: '#E63946',
        borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12,
    },
    emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});