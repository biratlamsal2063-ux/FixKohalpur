import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Alert, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase/firebaseConfig';
import { AuthContext } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/authService';

export default function ProviderDashboardScreen(props) {
    var navigation = props.navigation;
    var insets = useSafeAreaInsets();
    var authCtx = useContext(AuthContext);
    var user = authCtx.user;
    var profileState = useState(null); var profile = profileState[0]; var setProfile = profileState[1];
    var bookingsState = useState([]); var bookings = bookingsState[0]; var setBookings = bookingsState[1];
    var loadingState = useState(true); var loading = loadingState[0]; var setLoading = loadingState[1];
    var tabState = useState('pending'); var activeTab = tabState[0]; var setActiveTab = tabState[1];
    var availState = useState(true); var isAvailable = availState[0]; var setIsAvailable = availState[1];

    useEffect(function () {
        if (!user) return;
        getDoc(doc(db, 'providers', user.uid)).then(function (snap) {
            if (snap.exists()) { var d = snap.data(); setProfile(d); setIsAvailable(d.isAvailable !== false); }
        });
    }, [user]);

    useEffect(function () {
        if (!user) return;
        var q = query(collection(db, 'bookings'), where('providerId', '==', user.uid));
        var unsub = onSnapshot(q, function (snap) {
            var data = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
            data.sort(function (a, b) {
                var at = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate() : new Date(0);
                var bt = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate() : new Date(0);
                return bt - at;
            });
            setBookings(data); setLoading(false);
        }, function (e) { console.error(e); setLoading(false); });
        return unsub;
    }, [user]);

    async function toggleAvailability(val) {
        setIsAvailable(val);
        try { await updateDoc(doc(db, 'providers', user.uid), { isAvailable: val }); }
        catch (e) { setIsAvailable(!val); Alert.alert('Error', 'Could not update.'); }
    }

    async function updateStatus(bookingId, status) {
        try { await updateDoc(doc(db, 'bookings', bookingId), { status: status }); }
        catch (e) { Alert.alert('Error', 'Could not update status.'); }
    }

    function confirmDecline(bookingId) {
        Alert.alert('Decline Booking', 'Are you sure?', [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', style: 'destructive', onPress: function () { updateStatus(bookingId, 'cancelled'); } },
        ]);
    }

    var filtered = bookings.filter(function (b) {
        if (activeTab === 'pending') return b.status === 'pending';
        if (activeTab === 'confirmed') return b.status === 'confirmed' || b.status === 'started';
        if (activeTab === 'completed') return b.status === 'completed' || b.status === 'cancelled';
        return true;
    });

    var pendingCount = bookings.filter(function (b) { return b.status === 'pending'; }).length;
    var completedCount = bookings.filter(function (b) { return b.status === 'completed'; }).length;
    var earnings = bookings.filter(function (b) { return b.status === 'completed' && b.paymentStatus === 'paid'; }).reduce(function (s, b) { return s + (b.ratePerHour || 0); }, 0);

    function renderCard(info) {
        var item = info.item;
        var statusMap = { pending: { bg: '#FDF4E7', text: '#BA7517', label: 'New' }, confirmed: { bg: '#E1F5EE', text: '#0F6E56', label: 'Confirmed' }, started: { bg: '#EBF4F9', text: '#185FA5', label: 'In Progress' }, completed: { bg: '#EBF4F9', text: '#185FA5', label: 'Done' }, cancelled: { bg: '#FCEBEB', text: '#A32D2D', label: 'Cancelled' } };
        var sc = statusMap[item.status] || statusMap.pending;
        return (
            <View style={styles.card}>
                <View style={styles.cardTop}>
                    <View style={styles.custAvatar}><Text style={{ fontSize: 20 }}>👤</Text></View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardName}>{item.providerName || 'Customer Request'}</Text>
                        <Text style={styles.cardSub} numberOfLines={1}>{item.notes || (item.serviceType === 'electrician' ? 'Electrical work' : 'Plumbing work')}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: sc.bg }]}><Text style={[styles.badgeText, { color: sc.text }]}>{sc.label}</Text></View>
                </View>
                <View style={styles.divider} />
                <View style={styles.metaRow}>
                    {[{ l: 'Date', v: item.date || '—' }, { l: 'Time', v: item.timeSlot || '—' }, { l: 'Rate', v: 'Rs.' + item.ratePerHour }, { l: 'Pay', v: item.paymentStatus === 'paid' ? 'Paid' : 'Pending', c: item.paymentStatus === 'paid' ? '#0F6E56' : '#E63946' }].map(function (m, i) {
                        return (
                            <View key={i} style={[styles.meta, i > 0 && styles.metaBorder]}>
                                <Text style={styles.metaL}>{m.l}</Text>
                                <Text style={[styles.metaV, m.c && { color: m.c }]}>{m.v}</Text>
                            </View>
                        );
                    })}
                </View>
                <View style={styles.divider} />
                <View style={styles.actions}>
                    {item.status === 'pending' ? (
                        <>
                            <TouchableOpacity style={[styles.actionBtn, styles.actionDecline]} onPress={function () { confirmDecline(item.id); }}>
                                <Text style={styles.declineText}>Decline</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, styles.actionAccept]} onPress={function () { updateStatus(item.id, 'confirmed'); }}>
                                <Text style={styles.acceptText}>Accept</Text>
                            </TouchableOpacity>
                        </>
                    ) : null}
                    {item.status === 'confirmed' ? (
                        <>
                            <TouchableOpacity style={[styles.actionBtn, styles.actionBlue]} onPress={function () { navigation.navigate('ProviderChat', { booking: item }); }}>
                                <Text style={styles.blueText}>Message</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, styles.actionAccept]} onPress={function () { updateStatus(item.id, 'started'); }}>
                                <Text style={styles.acceptText}>Start Job</Text>
                            </TouchableOpacity>
                        </>
                    ) : null}
                    {item.status === 'started' ? (
                        <>
                            <TouchableOpacity style={[styles.actionBtn, styles.actionBlue]} onPress={function () { navigation.navigate('ProviderChat', { booking: item }); }}>
                                <Text style={styles.blueText}>Message</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, styles.actionAccept]} onPress={function () { updateStatus(item.id, 'completed'); }}>
                                <Text style={styles.acceptText}>Mark Done</Text>
                            </TouchableOpacity>
                        </>
                    ) : null}
                </View>
            </View>
        );
    }

    if (loading) return <View style={styles.loadingScreen}><ActivityIndicator size="large" color="#E63946" /></View>;

    return (
        <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="light-content" backgroundColor="#E63946" />
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greet}>Welcome back,</Text>
                        <Text style={styles.hname}>{profile ? profile.name.split(' ')[0] : 'Provider'} 👷</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutBtn} onPress={function () { Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: logoutUser }]); }}>
                        <Ionicons name="log-out-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.availRow}>
                    <View style={styles.availLeft}>
                        <View style={[styles.availDot, { backgroundColor: isAvailable ? '#A7F3D0' : '#FCEBEB' }]} />
                        <Text style={styles.availText}>{isAvailable ? 'Available for bookings' : 'Not accepting bookings'}</Text>
                    </View>
                    <Switch value={isAvailable} onValueChange={toggleAvailability} trackColor={{ false: 'rgba(255,255,255,0.2)', true: 'rgba(255,255,255,0.4)' }} thumbColor="#fff" />
                </View>
                <View style={styles.statsRow}>
                    {[{ v: pendingCount, l: 'New' }, { v: completedCount, l: 'Done' }, { v: 'Rs.' + earnings, l: 'Earned' }].map(function (s, i) {
                        return (
                            <View key={i} style={[styles.statBox, i > 0 && styles.statBorder]}>
                                <Text style={styles.statVal}>{s.v}</Text>
                                <Text style={styles.statLbl}>{s.l}</Text>
                            </View>
                        );
                    })}
                </View>
                <View style={styles.tabRow}>
                    {[{ key: 'pending', label: 'New Requests' }, { key: 'confirmed', label: 'Active' }, { key: 'completed', label: 'History' }].map(function (tab) {
                        return (
                            <TouchableOpacity key={tab.key} style={styles.tabItem} onPress={function () { setActiveTab(tab.key); }}>
                                <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabActive]}>{tab.label}</Text>
                                {activeTab === tab.key ? <View style={styles.tabUnderline} /> : null}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
            <FlatList
                data={filtered}
                keyExtractor={function (item) { return item.id; }}
                showsVerticalScrollIndicator={false}
                renderItem={renderCard}
                ListEmptyComponent={function () {
                    return (
                        <View style={styles.empty}>
                            <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
                            <Text style={styles.emptyTitle}>No bookings here</Text>
                            <Text style={styles.emptySub}>{activeTab === 'pending' ? 'New booking requests will appear here' : 'Nothing to show'}</Text>
                        </View>
                    );
                }}
                contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
            />
        </View>
    );
}

var styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F1FAEE' },
    loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1FAEE' },
    header: { backgroundColor: '#E63946', paddingHorizontal: 20 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    greet: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
    hname: { fontSize: 20, fontWeight: '700', color: '#fff' },
    logoutBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    availRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10, marginBottom: 14 },
    availLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    availDot: { width: 8, height: 8, borderRadius: 4 },
    availText: { fontSize: 13, color: '#fff', fontWeight: '500' },
    statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, marginBottom: 14, overflow: 'hidden' },
    statBox: { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 3 },
    statBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' },
    statVal: { fontSize: 16, fontWeight: '700', color: '#fff' },
    statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.75)' },
    tabRow: { flexDirection: 'row' },
    tabItem: { flex: 1, alignItems: 'center', paddingVertical: 10, position: 'relative' },
    tabLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
    tabActive: { color: '#fff' },
    tabUnderline: { position: 'absolute', bottom: 0, left: '10%', width: '80%', height: 2, backgroundColor: '#fff', borderRadius: 1 },
    card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#EEEEEE', marginBottom: 12, overflow: 'hidden' },
    cardTop: { flexDirection: 'row', alignItems: 'center', padding: 13, gap: 10 },
    custAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    cardInfo: { flex: 1, minWidth: 0 },
    cardName: { fontSize: 13, fontWeight: '700', color: '#1D1D1D' },
    cardSub: { fontSize: 11, color: '#6B6B6B', marginTop: 2 },
    badge: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
    badgeText: { fontSize: 9, fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#F5F5F5' },
    metaRow: { flexDirection: 'row', padding: 10 },
    meta: { flex: 1, alignItems: 'center', gap: 2 },
    metaBorder: { borderLeftWidth: 1, borderLeftColor: '#F5F5F5' },
    metaL: { fontSize: 9, color: '#A8A8A8', fontWeight: '600', textTransform: 'uppercase' },
    metaV: { fontSize: 11, color: '#1D1D1D', fontWeight: '700' },
    actions: { flexDirection: 'row' },
    actionBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRightWidth: 0.5, borderRightColor: '#F5F5F5' },
    actionDecline: { backgroundColor: '#FCEBEB' },
    actionAccept: { backgroundColor: '#E63946' },
    actionBlue: { backgroundColor: '#EBF4F9' },
    declineText: { fontSize: 12, fontWeight: '700', color: '#A32D2D' },
    acceptText: { fontSize: 12, fontWeight: '700', color: '#fff' },
    blueText: { fontSize: 12, fontWeight: '700', color: '#185FA5' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1D1D1D', marginBottom: 8 },
    emptySub: { fontSize: 13, color: '#A8A8A8', textAlign: 'center' },
});
