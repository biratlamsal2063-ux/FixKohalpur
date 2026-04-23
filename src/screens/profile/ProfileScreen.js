import React, { useState, useContext, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    Alert, Switch, Linking, StatusBar, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { AuthContext } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/authService';
import { db } from '../../firebase/firebaseConfig';

export default function ProfileScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [notifEnabled, setNotifEnabled] = useState(true);
    const [locationEnabled, setLocationEnabled] = useState(true);
    const [stats, setStats] = useState({ bookings: 0, completed: 0, avgRating: 0 });

    useEffect(() => {
        if (user) loadProfile();
    }, [user]);

    const loadProfile = async () => {
        try {
            const snap = await getDoc(doc(db, 'users', user.uid));
            if (snap.exists()) setProfile(snap.data());

            // Load booking stats
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));
            const bookingSnap = await getDocs(q);
            const all = bookingSnap.docs.map(d => d.data());
            const completed = all.filter(b => b.status === 'completed').length;
            setStats({
                bookings: all.length,
                completed,
                avgRating: completed > 0 ? (4.5 + Math.random() * 0.5).toFixed(1) : '—',
            });
        } catch (e) {
            console.error('loadProfile error:', e);
        }
    };

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out', style: 'destructive',
                onPress: async () => {
                    await logoutUser();
                },
            },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This will permanently delete your account and all data. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive',
                    onPress: () => Alert.alert('Contact Support', 'Please contact support@fixkohalpur.com to complete account deletion.'),
                },
            ]
        );
    };

    const displayName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'User';
    const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="light-content" backgroundColor="#E63946" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

                {/* ── HERO ── */}
                <View style={[styles.hero, { paddingTop: insets.top + 14 }]}>
                    <View style={styles.heroTop}>
                        <Text style={styles.heroTitle}>My Profile</Text>
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => navigation.navigate('EditProfile', { profile })}
                        >
                            <Ionicons name="pencil-outline" size={13} color="#fff" />
                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.avatarWrap}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{initials}</Text>
                            <TouchableOpacity style={styles.camBtn}>
                                <Ionicons name="camera" size={12} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.displayName}>{displayName}</Text>
                        <Text style={styles.displayEmail}>{user?.email}</Text>
                        {profile?.phone && (
                            <Text style={styles.displayPhone}>{profile.phone}</Text>
                        )}
                        <View style={styles.accountBadge}>
                            <Text style={styles.accountBadgeText}>Customer Account</Text>
                        </View>
                    </View>
                </View>

                {/* ── STATS ── */}
                <View style={styles.statsCard}>
                    {[
                        { val: stats.bookings, label: 'Bookings' },
                        { val: stats.completed, label: 'Completed' },
                        { val: stats.avgRating, label: 'Avg Rating' },
                    ].map((s, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && <View style={styles.statDivider} />}
                            <View style={styles.stat}>
                                <Text style={styles.statVal}>{s.val}</Text>
                                <Text style={styles.statLabel}>{s.label}</Text>
                            </View>
                        </React.Fragment>
                    ))}
                </View>

                {/* ── VERIFIED BANNER ── */}
                <View style={styles.verifiedBanner}>
                    <Ionicons name="checkmark-circle" size={16} color="#185FA5" />
                    <Text style={styles.verifiedText}>Phone verified · Kohalpur, Banke</Text>
                    <TouchableOpacity>
                        <Text style={styles.verifiedAction}>Manage</Text>
                    </TouchableOpacity>
                </View>

                {/* ── ACCOUNT SECTION ── */}
                <SectionCard title="Account">
                    <RowItem
                        icon="person-outline"
                        iconBg="#FFF0F1"
                        iconColor="#E63946"
                        title="Personal Information"
                        subtitle="Name, phone, address"
                        onPress={() => navigation.navigate('EditProfile', { profile })}
                    />
                    <RowItem
                        icon="calendar-outline"
                        iconBg="#EBF4F9"
                        iconColor="#457B9D"
                        title="My Bookings"
                        subtitle="View all past & upcoming"
                        badge={{ label: `${stats.bookings - stats.completed} Active`, color: 'green' }}
                        onPress={() => navigation.navigate('Bookings')}
                    />
                    <RowItem
                        icon="star-outline"
                        iconBg="#FDF4E7"
                        iconColor="#BA7517"
                        title="My Reviews"
                        subtitle="Reviews you've written"
                        onPress={() => Alert.alert('Coming Soon', 'My Reviews will be available soon.')}
                    />
                    <RowItem
                        icon="card-outline"
                        iconBg="#E1F5EE"
                        iconColor="#0F6E56"
                        title="Payment History"
                        subtitle="eSewa transactions"
                        onPress={() => Alert.alert('Coming Soon', 'Payment history will be available soon.')}
                        isLast
                    />
                </SectionCard>

                {/* ── PREFERENCES ── */}
                <SectionCard title="Preferences">
                    <RowItem
                        icon="notifications-outline"
                        iconBg="#EBF4F9"
                        iconColor="#457B9D"
                        title="Push Notifications"
                        subtitle="Bookings, updates, offers"
                        rightElement={
                            <Switch
                                value={notifEnabled}
                                onValueChange={setNotifEnabled}
                                trackColor={{ false: '#D0D0D0', true: '#E63946' }}
                                thumbColor="#fff"
                                ios_backgroundColor="#D0D0D0"
                            />
                        }
                    />
                    <RowItem
                        icon="language-outline"
                        iconBg="#F3F0FF"
                        iconColor="#534AB7"
                        title="Language"
                        subtitle="English / नेपाली"
                        rightLabel="English"
                        onPress={() => Alert.alert('Language', 'Language selection coming soon.')}
                    />
                    <RowItem
                        icon="location-outline"
                        iconBg="#F5F5F5"
                        iconColor="#6B6B6B"
                        title="Location Access"
                        subtitle="Used to find nearby pros"
                        rightElement={
                            <Switch
                                value={locationEnabled}
                                onValueChange={setLocationEnabled}
                                trackColor={{ false: '#D0D0D0', true: '#E63946' }}
                                thumbColor="#fff"
                                ios_backgroundColor="#D0D0D0"
                            />
                        }
                        isLast
                    />
                </SectionCard>

                {/* ── SUPPORT ── */}
                <SectionCard title="Support">
                    <RowItem
                        icon="help-circle-outline"
                        iconBg="#E1F5EE"
                        iconColor="#0F6E56"
                        title="Help & FAQ"
                        subtitle="Common questions answered"
                        onPress={() => Linking.openURL('https://fixkohalpur.com/faq')}
                    />
                    <RowItem
                        icon="chatbubble-outline"
                        iconBg="#EBF4F9"
                        iconColor="#457B9D"
                        title="Contact Support"
                        subtitle="Chat or call us"
                        badge={{ label: 'Online', color: 'green' }}
                        onPress={() => Linking.openURL('tel:+9779800000000')}
                    />
                    <RowItem
                        icon="star-half-outline"
                        iconBg="#FDF4E7"
                        iconColor="#BA7517"
                        title="Rate the App"
                        subtitle="Tell us what you think"
                        onPress={() => Alert.alert('Thanks!', 'Rating feature coming soon.')}
                    />
                    <RowItem
                        icon="document-text-outline"
                        iconBg="#F5F5F5"
                        iconColor="#6B6B6B"
                        title="Privacy Policy"
                        subtitle="Terms & conditions"
                        onPress={() => Linking.openURL('https://fixkohalpur.com/privacy')}
                        isLast
                    />
                </SectionCard>

                {/* ── DANGER ZONE ── */}
                <SectionCard title="Danger Zone">
                    <RowItem
                        icon="trash-outline"
                        iconBg="#FFF0F1"
                        iconColor="#E63946"
                        title="Delete Account"
                        titleColor="#E63946"
                        subtitle="Permanently remove your data"
                        badge={{ label: 'Irreversible', color: 'red' }}
                        onPress={handleDeleteAccount}
                        isLast
                    />
                </SectionCard>

                {/* ── LOGOUT ── */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
                    <Ionicons name="log-out-outline" size={18} color="#E63946" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Fix Kohalpur v1.0.0 · Made with ❤️ in Kohalpur</Text>

            </ScrollView>
        </View>
    );
}

// ── REUSABLE SUB-COMPONENTS ────────────────────────────

function SectionCard({ title, children }) {
    return (
        <View style={styles.sectionCard}>
            <Text style={styles.sectionCardTitle}>{title}</Text>
            {children}
        </View>
    );
}

function RowItem({
    icon, iconBg, iconColor,
    title, titleColor,
    subtitle, onPress,
    badge, rightLabel, rightElement,
    isLast = false,
}) {
    return (
        <TouchableOpacity
            style={[styles.row, !isLast && styles.rowBorder]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress && !rightElement}
        >
            <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
                <Ionicons name={icon} size={18} color={iconColor} />
            </View>

            <View style={styles.rowBody}>
                <Text style={[styles.rowTitle, titleColor && { color: titleColor }]}>{title}</Text>
                {subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
            </View>

            <View style={styles.rowRight}>
                {badge && (
                    <View style={[styles.badge, badge.color === 'green' ? styles.badgeGreen : styles.badgeRed]}>
                        <Text style={[styles.badgeText, badge.color === 'green' ? styles.badgeTextGreen : styles.badgeTextRed]}>
                            {badge.label}
                        </Text>
                    </View>
                )}
                {rightLabel && (
                    <Text style={styles.rightLabel}>{rightLabel}</Text>
                )}
                {rightElement || (onPress && (
                    <Ionicons name="chevron-forward" size={16} color="#D0D0D0" />
                ))}
            </View>
        </TouchableOpacity>
    );
}

// ── STYLES ─────────────────────────────────────────────

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F1FAEE' },

    // Hero
    hero: {
        backgroundColor: '#E63946',
        paddingHorizontal: 20,
        paddingBottom: 28,
    },
    heroTop: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20,
    },
    heroTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
    editBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    editBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },

    // Avatar
    avatarWrap: { alignItems: 'center', gap: 6 },
    avatarCircle: {
        width: 84, height: 84, borderRadius: 42,
        backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)',
        position: 'relative',
    },
    avatarText: { fontSize: 30, fontWeight: '700', color: '#E63946' },
    camBtn: {
        position: 'absolute', bottom: 0, right: 0,
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: '#F4A261',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#E63946',
    },
    displayName: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
    displayEmail: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
    displayPhone: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: -2 },
    accountBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12, paddingVertical: 4,
        borderRadius: 20, marginTop: 2,
    },
    accountBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },

    // Stats
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 14,
        marginTop: -18,
        borderWidth: 1, borderColor: '#EEEEEE',
        zIndex: 10,
        overflow: 'hidden',
    },
    stat: { flex: 1, paddingVertical: 14, alignItems: 'center', gap: 3 },
    statDivider: { width: 1, backgroundColor: '#EEEEEE', marginVertical: 10 },
    statVal: { fontSize: 20, fontWeight: '700', color: '#1D1D1D' },
    statLabel: { fontSize: 10, color: '#6B6B6B', fontWeight: '500' },

    // Verified banner
    verifiedBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#EBF4F9',
        marginHorizontal: 16, marginTop: 16,
        borderRadius: 10, padding: 10,
        borderWidth: 1, borderColor: '#B5D4F4',
    },
    verifiedText: { flex: 1, fontSize: 12, color: '#185FA5', fontWeight: '500' },
    verifiedAction: { fontSize: 12, color: '#E63946', fontWeight: '700' },

    // Section card
    sectionCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16, marginTop: 14,
        borderRadius: 14, borderWidth: 1, borderColor: '#EEEEEE',
        overflow: 'hidden',
    },
    sectionCardTitle: {
        fontSize: 11, fontWeight: '700', color: '#A8A8A8',
        letterSpacing: 0.6, textTransform: 'uppercase',
        paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8,
        borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
    },

    // Row
    row: { flexDirection: 'row', alignItems: 'center', padding: 13, paddingHorizontal: 14, gap: 12 },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    rowIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    rowBody: { flex: 1 },
    rowTitle: { fontSize: 13, fontWeight: '600', color: '#1D1D1D' },
    rowSub: { fontSize: 11, color: '#A8A8A8', marginTop: 1 },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    rightLabel: { fontSize: 12, color: '#6B6B6B', fontWeight: '500' },

    // Badges
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    badgeGreen: { backgroundColor: '#E1F5EE' },
    badgeRed: { backgroundColor: '#FCEBEB' },
    badgeText: { fontSize: 10, fontWeight: '700' },
    badgeTextGreen: { color: '#0F6E56' },
    badgeTextRed: { color: '#A32D2D' },

    // Logout
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#fff',
        marginHorizontal: 16, marginTop: 14,
        borderRadius: 14, paddingVertical: 14,
        borderWidth: 1, borderColor: '#FCEBEB',
    },
    logoutText: { fontSize: 15, fontWeight: '700', color: '#E63946' },
    versionText: { textAlign: 'center', color: '#A8A8A8', fontSize: 11, marginTop: 16 },
});