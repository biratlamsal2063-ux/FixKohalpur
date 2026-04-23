import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    collection, addDoc, query, orderBy,
    onSnapshot, serverTimestamp, doc, updateDoc,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase/firebaseConfig';
import { AuthContext } from '../../contexts/AuthContext';

export default function ChatScreen({ route, navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const { booking } = route.params;
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const listRef = useRef(null);

    const chatId = [user.uid, booking.providerId].sort().join('_') + '_' + booking.id;

    useEffect(() => {
        const q = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('createdAt', 'asc')
        );
        const unsub = onSnapshot(q, snap => {
            setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
        });
        return unsub;
    }, [chatId]);

    const sendMessage = async () => {
        const trimmed = text.trim();
        if (!trimmed || sending) return;
        setSending(true);
        setText('');
        try {
            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                text: trimmed,
                senderId: user.uid,
                senderName: user.displayName || 'User',
                createdAt: serverTimestamp(),
                type: 'text',
            });
            await updateDoc(doc(db, 'bookings', booking.id), {
                lastMessage: trimmed,
                lastMessageAt: serverTimestamp(),
            });
        } catch (e) {
            console.error('sendMessage error:', e);
        }
        setSending(false);
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date();
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = ({ item, index }) => {
        const isMe = item.senderId === user.uid;
        const prev = messages[index - 1];
        const showDate = !prev || (
            item.createdAt && prev.createdAt &&
            item.createdAt.toDate?.().toDateString() !==
            prev.createdAt.toDate?.().toDateString()
        );

        return (
            <>
                {showDate && (
                    <View style={styles.dateDivider}>
                        <Text style={styles.dateDividerText}>Today</Text>
                    </View>
                )}
                <View style={[styles.msgWrap, isMe && styles.msgWrapMe]}>
                    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                        <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                            {item.text}
                        </Text>
                        <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
                            {formatTime(item.createdAt)}{isMe ? '  ✓✓' : ''}
                        </Text>
                    </View>
                </View>
            </>
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
                <StatusBar barStyle="light-content" backgroundColor="#E63946" />

                <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerAvatar}>
                        <Text style={{ fontSize: 18 }}>
                            {booking.serviceType === 'electrician' ? '⚡' : '🔧'}
                        </Text>
                        {booking.status === 'confirmed' && <View style={styles.headerOnline} />}
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerName}>{booking.providerName}</Text>
                        <Text style={styles.headerStatus}>
                            {booking.status === 'confirmed' ? 'Online · ' : ''}{booking.serviceType}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.trackBtn}
                        onPress={() => navigation.navigate('TrackService', { booking })}
                    >
                        <Ionicons name="navigate-outline" size={14} color="#fff" />
                        <Text style={styles.trackBtnText}>Track</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bookingBanner}>
                    <Ionicons name="calendar-outline" size={13} color="#185FA5" />
                    <Text style={styles.bookingBannerText}>
                        #{booking.id.slice(0, 8).toUpperCase()} · {booking.date} · {booking.timeSlot}
                    </Text>
                </View>

                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderMessage}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.msgList}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyChat}>
                            <Text style={styles.emptyChatIcon}>👋</Text>
                            <Text style={styles.emptyChatText}>
                                Say hello to {booking.providerName}!
                            </Text>
                        </View>
                    )}
                    onContentSizeChange={() =>
                        listRef.current?.scrollToEnd({ animated: true })
                    }
                />

                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor="#A8A8A8"
                        value={text}
                        onChangeText={setText}
                        multiline
                        maxLength={500}
                        returnKeyType="send"
                        onSubmitEditing={sendMessage}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
                        onPress={sendMessage}
                        disabled={!text.trim() || sending}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="send" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F1FAEE' },

    header: {
        backgroundColor: '#E63946',
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, paddingBottom: 12, gap: 10,
    },
    backBtn: { padding: 2 },
    headerAvatar: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
        position: 'relative',
    },
    headerOnline: {
        width: 10, height: 10, backgroundColor: '#A7F3D0',
        borderRadius: 5, position: 'absolute',
        bottom: 0, right: 0, borderWidth: 1.5, borderColor: '#E63946',
    },
    headerInfo: { flex: 1 },
    headerName: { fontSize: 14, fontWeight: '700', color: '#fff' },
    headerStatus: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
    trackBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
    },
    trackBtnText: { color: '#fff', fontSize: 11, fontWeight: '600' },

    bookingBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#EBF4F9', padding: 10, paddingHorizontal: 16,
        borderBottomWidth: 1, borderBottomColor: '#B5D4F4',
    },
    bookingBannerText: { fontSize: 11, color: '#185FA5', fontWeight: '500', flex: 1 },

    msgList: { padding: 14, flexGrow: 1 },

    dateDivider: { alignItems: 'center', marginVertical: 12 },
    dateDividerText: {
        fontSize: 10, color: '#A8A8A8',
        backgroundColor: '#E8E8E8',
        paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
    },

    msgWrap: { marginBottom: 6, alignItems: 'flex-start' },
    msgWrapMe: { alignItems: 'flex-end' },
    bubble: { maxWidth: '78%', padding: 10, paddingHorizontal: 13, borderRadius: 16 },
    bubbleThem: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderWidth: 1, borderColor: '#EEEEEE',
    },
    bubbleMe: { backgroundColor: '#E63946', borderBottomRightRadius: 4 },
    bubbleText: { fontSize: 13, color: '#1D1D1D', lineHeight: 19 },
    bubbleTextMe: { color: '#fff' },
    bubbleTime: { fontSize: 10, color: '#A8A8A8', marginTop: 4, textAlign: 'right' },
    bubbleTimeMe: { color: 'rgba(255,255,255,0.7)' },

    emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
    emptyChatIcon: { fontSize: 40, marginBottom: 12 },
    emptyChatText: { fontSize: 14, color: '#A8A8A8', textAlign: 'center' },

    inputRow: {
        flexDirection: 'row', alignItems: 'flex-end',
        padding: 10, paddingHorizontal: 14,
        backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#EEEEEE',
        gap: 10,
    },
    input: {
        flex: 1, backgroundColor: '#F1FAEE',
        borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10,
        fontSize: 13, color: '#1D1D1D',
        borderWidth: 1, borderColor: '#EEEEEE',
        maxHeight: 100,
    },
    sendBtn: {
        width: 38, height: 38, backgroundColor: '#E63946',
        borderRadius: 19, justifyContent: 'center', alignItems: 'center',
    },
    sendBtnDisabled: { backgroundColor: '#F5A0A5' },
});