import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    View, Text, FlatList, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, RefreshControl,
    ScrollView, Animated, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchProviders } from '../../services/providerService';
import ProviderCard from '../../components/ProviderCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../contexts/AuthContext';

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Available Now' },
    { key: 'top', label: 'Top Rated' },
    { key: 'electrician', label: 'Electricians' },
    { key: 'plumber', label: 'Plumbers' },
];

const CATEGORIES = [
    { key: 'electrician', icon: '⚡', label: 'Electric', bg: '#FFF0F1' },
    { key: 'plumber', icon: '🔧', label: 'Plumber', bg: '#EBF4F9' },
    { key: 'ac', icon: '❄️', label: 'AC Repair', bg: '#EBF5F0' },
    { key: 'paint', icon: '🎨', label: 'Painting', bg: '#FDF4E7' },
    { key: 'all', icon: '➕', label: 'More', bg: '#F0F0F0' },
];

const BANNERS = [
    { tag: 'Special Offer', title: 'First Service\n20% OFF', sub: 'For new users only', color: '#E63946' },
    { tag: 'Verified Pro', title: 'Certified\nPlumbers', sub: 'Background checked', color: '#457B9D' },
];

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning,';
    if (h < 17) return 'Good afternoon,';
    return 'Good evening,';
};

export default function HomeScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const [providers, setProviders] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [activePill, setActivePill] = useState('all');
    const [activeCat, setActiveCat] = useState('electrician');

    // Staggered entrance animations
    const anims = useRef([...Array(10)].map(() => ({
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(20),
    }))).current;

    const runAnims = () => {
        anims.forEach((a, i) => {
            a.opacity.setValue(0);
            a.translateY.setValue(20);
            Animated.parallel([
                Animated.timing(a.opacity, { toValue: 1, duration: 350, delay: i * 60, useNativeDriver: true }),
                Animated.timing(a.translateY, { toValue: 0, duration: 350, delay: i * 60, useNativeDriver: true }),
            ]).start();
        });
    };

    const loadProviders = async () => {
        const data = await fetchProviders();
        setProviders(data);
        setLoading(false);
        setRefreshing(false);
        runAnims();
    };

    useEffect(() => { if (user) loadProviders(); }, [user]);

    // Apply all filters whenever any dep changes
    useEffect(() => {
        let result = [...providers];

        if (activeCat !== 'all' && activeCat !== 'ac' && activeCat !== 'paint') {
            result = result.filter(p => p.serviceType === activeCat);
        }
        if (activePill === 'available') result = result.filter(p => p.isAvailable);
        if (activePill === 'top') result = result.filter(p => (p.rating || 0) >= 4.5);
        if (activePill === 'electrician') result = result.filter(p => p.serviceType === 'electrician');
        if (activePill === 'plumber') result = result.filter(p => p.serviceType === 'plumber');
        if (search.trim()) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFiltered(result);
    }, [search, activePill, activeCat, providers]);

    // ── SUB COMPONENTS ─────────────────────────────────────

    const BannerSection = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 2 }}
        >
            {BANNERS.map((b, i) => (
                <View key={i} style={[styles.banner, { backgroundColor: b.color }]}>
                    <View style={styles.bannerCircle} />
                    <View>
                        <Text style={styles.bannerTag}>{b.tag}</Text>
                        <Text style={styles.bannerTitle}>{b.title}</Text>
                        <Text style={styles.bannerSub}>{b.sub}</Text>
                    </View>
                    <TouchableOpacity style={styles.bannerBtn}>
                        <Text style={styles.bannerBtnText}>Book Now →</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
    );

    const CategorySection = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 2 }}
        >
            {CATEGORIES.map(cat => (
                <TouchableOpacity
                    key={cat.key}
                    style={styles.catItem}
                    onPress={() => setActiveCat(cat.key)}
                    activeOpacity={0.7}
                >
                    <View style={[
                        styles.catCircle,
                        { backgroundColor: cat.bg },
                        activeCat === cat.key && styles.catCircleActive,
                    ]}>
                        <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                    </View>
                    <Text style={[styles.catLabel, activeCat === cat.key && styles.catLabelActive]}>
                        {cat.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const PillSection = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 2 }}
        >
            {FILTERS.map(f => (
                <TouchableOpacity
                    key={f.key}
                    style={[styles.pill, activePill === f.key && styles.pillActive]}
                    onPress={() => setActivePill(f.key)}
                    activeOpacity={0.75}
                >
                    <Text style={[styles.pillText, activePill === f.key && styles.pillTextActive]}>
                        {f.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const ListHeader = () => (
        <>
            {/* Banners */}
            <View style={styles.section}>
                <BannerSection />
            </View>

            {/* Categories */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
                </View>
                <CategorySection />
            </View>

            {/* Provider header + pills */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Top Providers</Text>
                    <Text style={styles.countLabel}>{filtered.length} found</Text>
                </View>
                <PillSection />
            </View>
        </>
    );

    // ── RENDER ──────────────────────────────────────────────

    if (loading) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator size="large" color="#E63946" />
                <Text style={styles.loadingText}>Finding pros near you...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="light-content" backgroundColor="#E63946" />

            {/* ── HEADER ── */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <View style={styles.locRow}>
                    <Ionicons name="location-sharp" size={12} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.locText}>Kohalpur, Banke</Text>
                </View>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()}</Text>
                        <Text style={styles.username}>
                            {user?.displayName?.split(' ')[0] || 'User'} 👋
                        </Text>
                    </View>
                    <View style={styles.avatarWrap}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.notifDot} />
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={16} color="#A8A8A8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search electricians, plumbers..."
                        placeholderTextColor="#A8A8A8"
                        value={search}
                        onChangeText={setSearch}
                        returnKeyType="search"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={16} color="#A8A8A8" />
                        </TouchableOpacity>
                    )}
                    <View style={styles.filterBtn}>
                        <Ionicons name="options-outline" size={14} color="#fff" />
                    </View>
                </View>
            </View>

            {/* ── MAIN LIST ── */}
            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={<ListHeader />}
                renderItem={({ item, index }) => (
                    <Animated.View style={{
                        paddingHorizontal: 16,
                        marginBottom: 10,
                        opacity: index < 10 ? anims[index].opacity : 1,
                        transform: [{ translateY: index < 10 ? anims[index].translateY : 0 }],
                    }}>
                        <ProviderCard
                            provider={item}
                            onPress={() => navigation.navigate('ServiceDetail', { provider: item })}
                        />
                    </Animated.View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <Text style={styles.emptyTitle}>No providers found</Text>
                        <Text style={styles.emptySub}>Try a different category or search term</Text>
                    </View>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        tintColor="#E63946"
                        colors={['#E63946']}
                        onRefresh={() => { setRefreshing(true); loadProviders(); }}
                    />
                }
                contentContainerStyle={{ paddingBottom: 32 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F1FAEE' },
    loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1FAEE' },
    loadingText: { color: '#6B6B6B', marginTop: 12, fontSize: 14 },

    // Header
    header: {
        backgroundColor: '#E63946',
        paddingTop: 48,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
    locText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
    greeting: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
    username: { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
    avatarWrap: { position: 'relative' },
    avatar: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: 16, fontWeight: '700', color: '#E63946' },
    notifDot: {
        width: 11, height: 11, backgroundColor: '#F4A261',
        borderRadius: 6, position: 'absolute',
        top: -1, right: -1, borderWidth: 2, borderColor: '#E63946',
    },

    // Search
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 12,
        paddingHorizontal: 12, paddingVertical: 10, gap: 8,
    },
    searchInput: { flex: 1, fontSize: 13, color: '#1D1D1D', padding: 0 },
    filterBtn: {
        width: 30, height: 30, backgroundColor: '#E63946',
        borderRadius: 8, justifyContent: 'center', alignItems: 'center',
    },

    // Sections
    section: { paddingHorizontal: 0, marginTop: 16 },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 12, paddingHorizontal: 16,
    },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1D1D1D' },
    seeAll: { fontSize: 12, color: '#E63946', fontWeight: '600' },
    countLabel: { fontSize: 12, color: '#6B6B6B' },

    // Banners
    banner: {
        width: 210, height: 104, borderRadius: 14,
        padding: 12, justifyContent: 'space-between',
        overflow: 'hidden', position: 'relative',
    },
    bannerCircle: {
        position: 'absolute', right: -20, top: -20,
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    bannerTag: { fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: '700', letterSpacing: 0.6, marginBottom: 2 },
    bannerTitle: { fontSize: 15, fontWeight: '700', color: '#fff', lineHeight: 20 },
    bannerSub: { fontSize: 10, color: 'rgba(255,255,255,0.75)' },
    bannerBtn: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
    },
    bannerBtnText: { color: '#fff', fontSize: 10, fontWeight: '600' },

    // Categories
    catItem: { alignItems: 'center', gap: 6, minWidth: 58 },
    catCircle: {
        width: 54, height: 54, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: 'transparent',
    },
    catCircleActive: { borderColor: '#E63946' },
    catLabel: { fontSize: 10, color: '#6B6B6B', fontWeight: '500' },
    catLabelActive: { color: '#E63946', fontWeight: '700' },

    // Filter Pills
    pill: {
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0',
    },
    pillActive: { backgroundColor: '#E63946', borderColor: '#E63946' },
    pillText: { fontSize: 11, color: '#6B6B6B', fontWeight: '500' },
    pillTextActive: { color: '#fff', fontWeight: '600' },

    // Empty
    emptyBox: { alignItems: 'center', paddingTop: 50, paddingHorizontal: 32 },
    emptyIcon: { fontSize: 36, marginBottom: 12 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1D1D1D', marginBottom: 6 },
    emptySub: { fontSize: 13, color: '#6B6B6B', textAlign: 'center' },
});