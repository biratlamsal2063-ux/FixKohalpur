import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    View, Text, FlatList, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, RefreshControl,
    ScrollView, Animated, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { fetchProviders } from '../../services/providerService';
import ProviderCard from '../../components/ProviderCard';
import { AuthContext } from '../../contexts/AuthContext';
import FilterSheet, {
    DEFAULT_FILTERS,
    applyFilters,
    countActiveFilters,
} from '../../components/FilterSheet';

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

    const [profileName, setProfileName] = useState('');
    const [providers, setProviders] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState('electrician');
    const [filters, setFilters] = useState(DEFAULT_FILTERS);  // ← filter state
    const [filterOpen, setFilterOpen] = useState(false);             // ← sheet open/close

    const anims = useRef(
        [...Array(10)].map(() => ({
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(20),
        }))
    ).current;

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

    // Fetch real name from Firestore
    useEffect(() => {
        const fetchName = async () => {
            if (!user) return;
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists() && snap.data().name) {
                    setProfileName(snap.data().name.split(' ')[0]);
                } else if (user.displayName) {
                    setProfileName(user.displayName.split(' ')[0]);
                } else {
                    setProfileName(user.email?.split('@')[0] || 'User');
                }
            } catch (e) {
                setProfileName(user.displayName?.split(' ')[0] || 'User');
            }
        };
        fetchName();
    }, [user]);

    const loadProviders = async () => {
        const data = await fetchProviders();
        setProviders(data);
        setLoading(false);
        setRefreshing(false);
        runAnims();
        //shows in breif if refreshed manually 

        if (refreshing) {
            //already handeled by the state
        }
    };

    useEffect(() => { if (user) loadProviders(); }, [user]);

    // Re-run filters whenever search, filters, category or providers change
    useEffect(() => {
        // Merge category filter into the filters object temporarily
        const merged = { ...filters };
        if (activeCat !== 'all' && activeCat !== 'ac' && activeCat !== 'paint') {
            merged.type = activeCat;
        }
        const result = applyFilters(providers, merged, search);
        setFiltered(result);
    }, [search, filters, activeCat, providers]);

    // Count how many filters are active to show badge on button
    const activeFilterCount = countActiveFilters(filters);

    // Active filter tags shown below search bar
    const getActiveFilterTags = () => {
        const tags = [];
        if (filters.type !== 'all') tags.push({ label: filters.type === 'electrician' ? '⚡ Electrician' : '🔧 Plumber', key: 'type' });
        if (filters.availability !== 'all') tags.push({ label: filters.availability === 'available' ? '🟢 Available' : '🔴 Busy', key: 'availability' });
        if (filters.price !== 'all') tags.push({ label: `≤ Rs.${filters.price}`, key: 'price' });
        if (filters.rating !== '0') tags.push({ label: `${filters.rating}★+`, key: 'rating' });
        if (filters.sort !== 'rating') tags.push({ label: `Sort: ${filters.sort.replace('_', ' ')}`, key: 'sort' });
        return tags;
    };

    const removeTag = (key) => {
        setFilters(prev => ({ ...prev, [key]: DEFAULT_FILTERS[key] }));
    };

    // ── SUB COMPONENTS ─────────────────────────────────

    const BannerSection = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 2 }}
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
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 2 }}
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

    const ListHeader = () => (
        <>
            <View style={styles.section}><BannerSection /></View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
                </View>
                <CategorySection />
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Top Providers</Text>
                    <Text style={styles.countLabel}>{filtered.length} found</Text>
                </View>
            </View>
        </>
    );

    if (loading) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator size="large" color="#E63946" />
                <Text style={styles.loadingText}>Finding pros near you...</Text>
            </View>
        );
    }

    const filterTags = getActiveFilterTags();

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
                        <Text style={styles.username}>{profileName || 'User'} 👋</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Profile')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.avatarWrap}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {(profileName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.notifDot} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Search bar */}
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

                    {/* ── FILTER BUTTON ── */}
                    <TouchableOpacity
                        style={styles.filterBtn}
                        onPress={() => setFilterOpen(true)}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="options-outline" size={15} color="#fff" />
                        {/* Orange badge shows count of active filters */}
                        {activeFilterCount > 0 && (
                            <View style={styles.filterBadge}>
                                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Active filter tags */}
                {filterTags.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 6, paddingTop: 10 }}
                    >
                        {filterTags.map(tag => (
                            <TouchableOpacity
                                key={tag.key}
                                style={styles.filterTag}
                                onPress={() => removeTag(tag.key)}
                            >
                                <Text style={styles.filterTagText}>{tag.label}</Text>
                                <Ionicons name="close" size={11} color="#E63946" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* ── LIST ── */}
            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={<ListHeader />}
                renderItem={({ item, index }) => (
                    <Animated.View style={{
                        paddingHorizontal: 20,
                        marginBottom: 14,
                        opacity: index < 10 ? anims[index].opacity : 1,
                        transform: index < 10 ? [{ translateY: anims[index].translateY }] : [],
                    }}>
                        <ProviderCard
                            provider={item}
                            onPress={() => navigation.navigate('ServiceDetail', { provider: item })}
                        />
                    </Animated.View>
                )}
                ListEmptyComponent={function () {
                    return (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyIcon}>🔍</Text>
                            <Text style={styles.emptyTitle}>No providers found</Text>
                            <Text style={styles.emptySub}>
                                {search.trim()
                                    ? 'No results for "' + search + '". Try a different search.'
                                    : activeFilterCount > 0
                                        ? 'No providers match your filters. Try clearing them.'
                                        : 'No providers available right now. Check back soon.'}
                            </Text>
                            {activeFilterCount > 0 && (
                                <TouchableOpacity
                                    style={styles.clearFiltersBtn}
                                    onPress={function () { setFilters(DEFAULT_FILTERS); }}
                                >
                                    <Text style={styles.clearFiltersBtnText}>Clear All Filters</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                }}
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

            {/* ── FILTER SHEET ── */}
            <FilterSheet
                visible={filterOpen}
                onClose={() => setFilterOpen(false)}
                filters={filters}
                onApply={(newFilters) => setFilters(newFilters)}
                resultCount={filtered.length}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F1FAEE' },
    loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1FAEE' },
    loadingText: { color: '#6B6B6B', marginTop: 12, fontSize: 14 },

    header: {
        backgroundColor: '#E63946',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
    locText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
    headerTop: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 14,
    },
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

    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 12,
        paddingHorizontal: 14, paddingVertical: 12, gap: 8,
    },
    searchInput: { flex: 1, fontSize: 13, color: '#1D1D1D', padding: 0 },

    filterBtn: {
        width: 32, height: 32, backgroundColor: '#E63946',
        borderRadius: 9, justifyContent: 'center',
        alignItems: 'center', position: 'relative',
    },
    filterBadge: {
        position: 'absolute', top: -5, right: -5,
        width: 16, height: 16, backgroundColor: '#F4A261',
        borderRadius: 8, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#fff',
    },
    filterBadgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },

    filterTag: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
    },
    filterTagText: { fontSize: 11, color: '#fff', fontWeight: '600' },

    section: { paddingHorizontal: 0, marginTop: 20 },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 14, paddingHorizontal: 20,
    },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1D1D1D' },
    seeAll: { fontSize: 12, color: '#E63946', fontWeight: '600' },
    countLabel: { fontSize: 12, color: '#6B6B6B' },

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

    catItem: { alignItems: 'center', gap: 6, minWidth: 58 },
    catCircle: {
        width: 54, height: 54, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: 'transparent',
    },
    catCircleActive: { borderColor: '#E63946' },
    catLabel: { fontSize: 10, color: '#6B6B6B', fontWeight: '500' },
    catLabelActive: { color: '#E63946', fontWeight: '700' },

    emptyBox: { alignItems: 'center', paddingTop: 50, paddingHorizontal: 32 },
    emptyIcon: { fontSize: 36, marginBottom: 12 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1D1D1D', marginBottom: 6 },
    emptySub: { fontSize: 13, color: '#6B6B6B', textAlign: 'center' },
    clearFiltersBtn: {
        marginTop: 16, backgroundColor: '#E63946',
        borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10,
    },
    clearFiltersBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});