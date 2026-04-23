import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, StatusBar, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase/firebaseConfig';
import { AuthContext } from '../../contexts/AuthContext';

export default function MessagesScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'bookings'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setConversations(data);
            setLoading(false);
        });
        return unsub;
    }, [user]);

    const formatTime = (ts) => {
        if (!ts) return '';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        const now = new Date();
        const diff = now - date;
        if (diff < 86400000) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return 'Yesterday';
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.convItem}
            onPress={() => navigation.navigate('Chat', { booking: item })}
            activeOpacity={0.75}
        >
            <View style={[styles.convAvatar, item.serviceType === 'electrician' ? styles.avEl : styles.avPl]}>
                <Text style={{ fontSize: 22 }}>{item.serviceType === 'electrician' ? '⚡' : '🔧'}</Text>
                {item.status === 'confirmed' && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.convBody}>
                <Text style={styles.convName}>{item.providerName}</Text>
                <Text style={styles.convMsg} numberOfLines={1}>
                    {item.lastMessage || 'Tap to open conversation'}
                </Text>
                <View style={styles.bookingBadge}>
                    <Text style={styles.bookingBadgeText}>
                        #{item.id.slice(0, 8).toUpperCase()} · {item.serviceType}
                    </Text>
                </View>
            </View>

            <View style={styles.convRight}>
                <Text style={styles.convTime}>{formatTime(item.createdAt)}</Text>
                <View style={[
                    styles.statusPill,
                    item.status === 'confirmed' ? styles.pillGreen :
                        item.status === 'completed' ? styles.pillBlue : styles.pillGray,
                ]}>
                    <Text style={[
                        styles.statusPillText,
                        item.status === 'confirmed' ? styles.pillGreenText :
                            item.status === 'completed' ? styles.pillBlueText : styles.pillGrayText,
                    ]}>
                        {item.status}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator size="large" color="#E63946" />
            </View>
        );
    }

    return (
        <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="light-content" backgroundColor="#E63946" />

            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <Text style={styles.headerTitle}>Messages</Text>
                <Text style={styles.headerSub}>{conversations.length} conversations</Text>
            </View>

            <FlatList
                data={conversations}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyIcon}>💬</Text>
                        <Text style={styles.emptyTitle}>No messages yet</Text>
                        <Text style={styles.emptySub}>
                            Book a service to start chatting with a technician
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyBtn}
                            onPress={() => navigation.navigate('HomeTab')}
                        >
                            <Text style={styles.emptyBtnText}>Browse Services</Text>
                        </TouchableOpacity>
                    </View>
                )}
                contentContainerStyle={{ flexGrow: 1 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F1FAEE' },
    loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1FAEE' },

    header: {
        backgroundColor: '#E63946',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

    convItem: {
        flexDirection: 'row', alignItems: 'center',
        padding: 14, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
        gap: 12,
    },
    convAvatar: {
        width: 48, height: 48, borderRadius: 24,
        justifyContent: 'center', alignItems: 'center',
        position: 'relative', flexShrink: 0,
    },
    avEl: { backgroundColor: '#FFF0F1' },
    avPl: { backgroundColor: '#EBF4F9' },
    onlineDot: {
        width: 11, height: 11, backgroundColor: '#1D9E75',
        borderRadius: 6, position: 'absolute',
        bottom: 0, right: 0, borderWidth: 2, borderColor: '#fff',
    },
    convBody: { flex: 1, minWidth: 0 },
    convName: { fontSize: 13, fontWeight: '700', color: '#1D1D1D' },
    convMsg: { fontSize: 11, color: '#A8A8A8', marginTop: 2 },
    bookingBadge: {
        backgroundColor: '#FFF0F1', borderRadius: 10,
        paddingHorizontal: 6, paddingVertical: 2,
        alignSelf: 'flex-start', marginTop: 4,
    },
    bookingBadgeText: { fontSize: 9, color: '#E63946', fontWeight: '700' },

    convRight: { alignItems: 'flex-end', gap: 6 },
    convTime: { fontSize: 10, color: '#A8A8A8' },
    statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    pillGreen: { backgroundColor: '#E1F5EE' },
    pillBlue: { backgroundColor: '#EBF4F9' },
    pillGray: { backgroundColor: '#F0F0F0' },
    statusPillText: { fontSize: 9, fontWeight: '700', textTransform: 'capitalize' },
    pillGreenText: { color: '#0F6E56' },
    pillBlueText: { color: '#185FA5' },
    pillGrayText: { color: '#6B6B6B' },

    emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1D1D1D', marginBottom: 8 },
    emptySub: { fontSize: 13, color: '#A8A8A8', textAlign: 'center', lineHeight: 20 },
    emptyBtn: {
        marginTop: 20, backgroundColor: '#E63946',
        borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12,
    },
    emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});