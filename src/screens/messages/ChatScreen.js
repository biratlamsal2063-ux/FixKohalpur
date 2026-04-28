import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
    Linking, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    collection, addDoc, query, orderBy,
    onSnapshot, serverTimestamp, doc, updateDoc,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase/firebaseConfig';
import { AuthContext } from '../../contexts/AuthContext';

export default function ChatScreen(props) {
    var route = props.route;
    var navigation = props.navigation;
    var insets = useSafeAreaInsets();
    var authCtx = useContext(AuthContext);
    var user = authCtx.user;
    var role = authCtx.role;

    var booking = route && route.params && route.params.booking;

    var msgsState = useState([]);
    var messages = msgsState[0];
    var setMessages = msgsState[1];

    var textState = useState('');
    var text = textState[0];
    var setText = textState[1];

    var sendingState = useState(false);
    var sending = sendingState[0];
    var setSending = sendingState[1];

    var listRef = useRef(null);

    if (!booking) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1FAEE' }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1D1D1D', marginBottom: 6 }}>Chat not found</Text>
                <TouchableOpacity onPress={function () { navigation.goBack(); }} style={{ backgroundColor: '#E63946', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 }}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Unique chat ID — same for both sides
    var chatId = [booking.userId, booking.providerId].sort().join('_') + '_' + booking.id;

    useEffect(function () {
        var q = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('createdAt', 'asc')
        );
        var unsub = onSnapshot(q, function (snap) {
            var data = snap.docs.map(function (d) {
                return Object.assign({ id: d.id }, d.data());
            });
            setMessages(data);
            setTimeout(function () {
                if (listRef.current) listRef.current.scrollToEnd({ animated: true });
            }, 100);
        }, function (e) {
            console.error('Chat listener error:', e);
        });
        return unsub;
    }, [chatId]);

    async function sendMessage() {
        var trimmed = text.trim();
        if (!trimmed || sending) return;
        setSending(true);
        setText('');
        try {
            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                text: trimmed,
                senderId: user.uid,
                senderRole: role,
                createdAt: serverTimestamp(),
            });
            // Update last message on booking
            await updateDoc(doc(db, 'bookings', booking.id), {
                lastMessage: trimmed,
                lastMessageAt: serverTimestamp(),
            });
        } catch (e) {
            console.error('sendMessage error:', e);
            Alert.alert('Error', 'Could not send message. Please try again.');
        }
        setSending(false);
    }

    function formatTime(ts) {
        if (!ts) return '';
        var d = ts.toDate ? ts.toDate() : new Date();
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    // Header info depends on who is viewing
    var headerName = role === 'provider' ? 'Customer' : (booking.providerName || 'Provider');
    var headerSub = role === 'provider' ? 'Customer' : (booking.serviceType || 'Service');
    var headerEmoji = booking.serviceType === 'electrician' ? '⚡' : '🔧';

    function renderMessage(info) {
        var item = info.item;
        var index = info.index;
        var isMe = item.senderId === user.uid;
        var prev = messages[index - 1];
        var showDate = !prev;

        return (
            <View>
                {showDate ? (
                    <View style={styles.dateDivider}>
                        <Text style={styles.dateDividerText}>Today</Text>
                    </View>
                ) : null}
                <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
                    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                        <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                            {item.text}
                        </Text>
                        <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
                            {formatTime(item.createdAt)}{isMe ? '  ✓✓' : ''}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
                <StatusBar barStyle="light-content" backgroundColor="#E63946" />

                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                    <TouchableOpacity onPress={function () { navigation.goBack(); }} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerAvatar}>
                        <Text style={{ fontSize: 18 }}>{headerEmoji}</Text>
                        <View style={styles.headerOnline} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerName}>{headerName}</Text>
                        <Text style={styles.headerSub}>{headerSub}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        {booking.providerPhone && role !== 'provider' ? (
                            <TouchableOpacity
                                style={styles.headerBtn}
                                onPress={function () {
                                    Alert.alert(
                                        booking.providerName || 'Provider',
                                        'Phone: ' + booking.providerPhone,
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            {
                                                text: 'Call Now',
                                                onPress: function () { Linking.openURL('tel:' + booking.providerPhone); },
                                            },
                                        ]
                                    );
                                }}
                            >
                                <Ionicons name="call-outline" size={16} color="#fff" />
                            </TouchableOpacity>
                        ) : null}
                        <TouchableOpacity
                            style={styles.headerBtn}
                            onPress={function () { navigation.navigate('TrackService', { booking: booking }); }}
                        >
                            <Ionicons name="navigate-outline" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Booking info banner */}
                <View style={styles.banner}>
                    <Ionicons name="calendar-outline" size={13} color="#185FA5" />
                    <Text style={styles.bannerText} numberOfLines={1}>
                        {'#' + booking.id.slice(0, 6).toUpperCase() + ' · ' + (booking.date || '') + ' · ' + (booking.timeSlot || '')}
                    </Text>
                    <View style={[styles.bannerStatus, { backgroundColor: booking.status === 'completed' ? '#E1F5EE' : '#FDF4E7' }]}>
                        <Text style={[styles.bannerStatusText, { color: booking.status === 'completed' ? '#0F6E56' : '#BA7517' }]}>
                            {booking.status}
                        </Text>
                    </View>
                </View>

                {/* Messages */}
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={function (item) { return item.id; }}
                    renderItem={renderMessage}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.msgList}
                    ListEmptyComponent={function () {
                        return (
                            <View style={styles.emptyChat}>
                                <Text style={styles.emptyChatIcon}>👋</Text>
                                <Text style={styles.emptyChatText}>
                                    {'Say hello to ' + headerName + '!'}
                                </Text>
                            </View>
                        );
                    }}
                    onContentSizeChange={function () {
                        if (listRef.current) listRef.current.scrollToEnd({ animated: true });
                    }}
                />

                {/* Input */}
                <View style={styles.inputRow}>
                    <View style={styles.inputWrap}>
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
                    </View>
                    <TouchableOpacity
                        style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnOff]}
                        onPress={sendMessage}
                        disabled={!text.trim() || sending}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="send" size={15} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

var styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F1FAEE' },

    header: {
        backgroundColor: '#E63946',
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, paddingBottom: 12, gap: 10,
    },
    backBtn: { padding: 2 },
    headerAvatar: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
        position: 'relative',
    },
    headerOnline: {
        width: 9, height: 9, backgroundColor: '#A7F3D0',
        borderRadius: 5, position: 'absolute',
        bottom: 0, right: 0,
        borderWidth: 1.5, borderColor: '#E63946',
    },
    headerInfo: { flex: 1 },
    headerName: { fontSize: 14, fontWeight: '700', color: '#fff' },
    headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1, textTransform: 'capitalize' },
    headerActions: { flexDirection: 'row', gap: 8 },
    headerBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },

    banner: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#EBF4F9', padding: 10, paddingHorizontal: 16,
        borderBottomWidth: 0.5, borderBottomColor: '#B5D4F4',
    },
    bannerText: { flex: 1, fontSize: 11, color: '#185FA5', fontWeight: '500' },
    bannerStatus: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
    bannerStatusText: { fontSize: 9, fontWeight: '700', textTransform: 'capitalize' },

    msgList: { padding: 14, flexGrow: 1 },

    dateDivider: { alignItems: 'center', marginVertical: 10 },
    dateDividerText: {
        fontSize: 10, color: '#A8A8A8',
        backgroundColor: '#E8E8E8',
        paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
    },

    msgRow: { marginBottom: 5, alignItems: 'flex-start' },
    msgRowMe: { alignItems: 'flex-end' },
    bubble: { maxWidth: '78%', padding: 10, paddingHorizontal: 13, borderRadius: 16 },
    bubbleThem: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 3,
        borderWidth: 0.5, borderColor: '#EEEEEE',
    },
    bubbleMe: { backgroundColor: '#E63946', borderBottomRightRadius: 3 },
    bubbleText: { fontSize: 13, color: '#1D1D1D', lineHeight: 19 },
    bubbleTextMe: { color: '#fff' },
    bubbleTime: { fontSize: 10, color: '#A8A8A8', marginTop: 3, textAlign: 'right' },
    bubbleTimeMe: { color: 'rgba(255,255,255,0.7)' },

    emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
    emptyChatIcon: { fontSize: 40, marginBottom: 12 },
    emptyChatText: { fontSize: 14, color: '#A8A8A8', textAlign: 'center' },

    inputRow: {
        flexDirection: 'row', alignItems: 'flex-end',
        padding: 10, paddingHorizontal: 14,
        backgroundColor: '#fff',
        borderTopWidth: 0.5, borderTopColor: '#EEEEEE', gap: 10,
    },
    inputWrap: {
        flex: 1, backgroundColor: '#F1FAEE',
        borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10,
        borderWidth: 0.5, borderColor: '#EEEEEE',
    },
    input: { fontSize: 13, color: '#1D1D1D', maxHeight: 100 },
    sendBtn: { width: 38, height: 38, backgroundColor: '#E63946', borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
    sendBtnOff: { backgroundColor: '#F5A0A5' },
});