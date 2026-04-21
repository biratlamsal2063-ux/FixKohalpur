import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, FlatList, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { fetchProviders } from '../../services/providerService';
import ProviderCard from '../../components/ProviderCard';
import { COLORS } from '../../constants/colors';
import { AuthContext } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';

const FILTERS = ['All', 'electrician', 'plumber'];

export default function HomeScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const [providers, setProviders] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const loadProviders = async () => {
        const data = await fetchProviders();
        setProviders(data);
        setFiltered(data);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        if (user) {          // ✅ Only fetch when user is logged in
            loadProviders();
        }
    }, [user]);

    useEffect(() => {
        let result = providers;
        if (activeFilter !== 'All') result = result.filter(p => p.serviceType === activeFilter);
        if (search.trim()) result = result.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(result);
    }, [search, activeFilter, providers]);

    if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {user?.displayName || 'User'} 👋</Text>
                    <Text style={styles.subGreeting}>Find a service in Kohalpur</Text>
                </View>
                <TouchableOpacity onPress={logoutUser}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchRow}>
                <Ionicons name="search-outline" size={18} color={COLORS.gray} style={{ marginRight: 8 }} />
                <TextInput
                    style={{ flex: 1, fontSize: 15 }}
                    placeholder="Search providers..."
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Filter Pills */}
            <View style={styles.filters}>
                {FILTERS.map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.pill, activeFilter === f && styles.pillActive]}
                        onPress={() => setActiveFilter(f)}
                    >
                        <Text style={[styles.pillText, activeFilter === f && { color: '#fff' }]}>
                            {f === 'All' ? 'All' : f === 'electrician' ? '⚡ Electricians' : '🔧 Plumbers'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <ProviderCard
                        provider={item}
                        onPress={() => navigation.navigate('ServiceDetail', { provider: item })}
                    />
                )}
                ListEmptyComponent={<Text style={styles.empty}>No providers found.</Text>}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProviders(); }} />
                }
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
    greeting: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
    subGreeting: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
    searchRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 10,
        marginHorizontal: 16, marginBottom: 12,
        paddingHorizontal: 14, paddingVertical: 10,
        elevation: 2,
    },
    filters: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
    pill: { borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 6 },
    pillActive: { backgroundColor: COLORS.primary },
    pillText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
    empty: { textAlign: 'center', marginTop: 60, color: COLORS.textSecondary, fontSize: 16 },
});