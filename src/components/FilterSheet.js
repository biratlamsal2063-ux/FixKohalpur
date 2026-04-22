import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    Modal, ScrollView, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SERVICE_TYPES = [
    { key: 'all', label: 'All' },
    { key: 'electrician', label: '⚡ Electrician' },
    { key: 'plumber', label: '🔧 Plumber' },
];

const AVAILABILITY = [
    { key: 'all', label: 'All' },
    { key: 'available', label: '🟢 Available Now' },
    { key: 'busy', label: '🔴 Busy' },
];

const PRICE_RANGES = [
    { key: 'all', label: 'Any Price' },
    { key: '500', label: 'Under Rs.500' },
    { key: '700', label: 'Under Rs.700' },
    { key: '1000', label: 'Under Rs.1000' },
];

const RATINGS = [
    { key: '0', label: 'Any' },
    { key: '3', label: '3★+' },
    { key: '4', label: '4★+' },
    { key: '4.5', label: '4.5★' },
];

const SORT_OPTIONS = [
    { key: 'rating', label: 'Top Rated' },
    { key: 'price_low', label: 'Price: Low' },
    { key: 'price_high', label: 'Price: High' },
    { key: 'reviews', label: 'Most Reviews' },
];

export const DEFAULT_FILTERS = {
    type: 'all',
    availability: 'all',
    price: 'all',
    rating: '0',
    sort: 'rating',
};

export function applyFilters(providers, filters, search) {
    let result = [...providers];

    if (filters.type !== 'all') {
        result = result.filter(p => p.serviceType === filters.type);
    }
    if (filters.availability === 'available') {
        result = result.filter(p => p.isAvailable === true);
    }
    if (filters.availability === 'busy') {
        result = result.filter(p => p.isAvailable === false);
    }
    if (filters.price !== 'all') {
        result = result.filter(p => p.ratePerHour <= parseInt(filters.price));
    }
    if (filters.rating !== '0') {
        result = result.filter(p => (p.rating || 0) >= parseFloat(filters.rating));
    }
    if (search.trim()) {
        result = result.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase())
        );
    }

    // Sort
    if (filters.sort === 'rating') {
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters.sort === 'price_low') {
        result.sort((a, b) => a.ratePerHour - b.ratePerHour);
    } else if (filters.sort === 'price_high') {
        result.sort((a, b) => b.ratePerHour - a.ratePerHour);
    } else if (filters.sort === 'reviews') {
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    return result;
}

export function countActiveFilters(filters) {
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.availability !== 'all') count++;
    if (filters.price !== 'all') count++;
    if (filters.rating !== '0') count++;
    if (filters.sort !== 'rating') count++;
    return count;
}

export default function FilterSheet({ visible, onClose, filters, onApply, resultCount }) {
    const [local, setLocal] = useState({ ...filters });

    const set = (key, val) => setLocal(prev => ({ ...prev, [key]: val }));

    const handleApply = () => {
        onApply(local);
        onClose();
    };

    const handleReset = () => {
        const reset = { ...DEFAULT_FILTERS };
        setLocal(reset);
    };

    const Section = ({ title, children }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );

    const ChipRow = ({ options, selected, onSelect }) => (
        <View style={styles.chipRow}>
            {options.map(opt => (
                <TouchableOpacity
                    key={opt.key}
                    style={[styles.chip, selected === opt.key && styles.chipActive]}
                    onPress={() => onSelect(opt.key)}
                    activeOpacity={0.75}
                >
                    <Text style={[styles.chipText, selected === opt.key && styles.chipTextActive]}>
                        {opt.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    style={styles.sheet}
                    activeOpacity={1}
                    onPress={() => { }}
                >
                    {/* Handle */}
                    <View style={styles.handle} />

                    {/* Header */}
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>Filter Providers</Text>
                        <TouchableOpacity onPress={handleReset}>
                            <Text style={styles.resetBtn}>Reset All</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Filters */}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
                    >
                        <Section title="Service Type">
                            <ChipRow
                                options={SERVICE_TYPES}
                                selected={local.type}
                                onSelect={val => set('type', val)}
                            />
                        </Section>

                        <Section title="Availability">
                            <ChipRow
                                options={AVAILABILITY}
                                selected={local.availability}
                                onSelect={val => set('availability', val)}
                            />
                        </Section>

                        <Section title="Price Range">
                            <ChipRow
                                options={PRICE_RANGES}
                                selected={local.price}
                                onSelect={val => set('price', val)}
                            />
                        </Section>

                        <Section title="Minimum Rating">
                            <ChipRow
                                options={RATINGS}
                                selected={local.rating}
                                onSelect={val => set('rating', val)}
                            />
                        </Section>

                        <Section title="Sort By">
                            <ChipRow
                                options={SORT_OPTIONS}
                                selected={local.sort}
                                onSelect={val => set('sort', val)}
                            />
                        </Section>
                    </ScrollView>

                    {/* Apply button */}
                    <TouchableOpacity
                        style={styles.applyBtn}
                        onPress={handleApply}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                        <Text style={styles.applyBtnText}>
                            Show {resultCount} Result{resultCount !== 1 ? 's' : ''}
                        </Text>
                    </TouchableOpacity>

                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 24,
        maxHeight: '85%',
    },
    handle: {
        width: 36, height: 4, backgroundColor: '#E0E0E0',
        borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 14,
    },
    sheetHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: 16,
        paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
        marginBottom: 4,
    },
    sheetTitle: { fontSize: 15, fontWeight: '700', color: '#1D1D1D' },
    resetBtn: { fontSize: 12, color: '#E63946', fontWeight: '600' },

    section: { marginTop: 16 },
    sectionTitle: {
        fontSize: 11, fontWeight: '700', color: '#A8A8A8',
        textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1,
        borderColor: '#E0E0E0', backgroundColor: '#fff',
    },
    chipActive: { backgroundColor: '#E63946', borderColor: '#E63946' },
    chipText: { fontSize: 12, color: '#6B6B6B', fontWeight: '500' },
    chipTextActive: { color: '#fff', fontWeight: '600' },

    applyBtn: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8,
        backgroundColor: '#E63946', marginHorizontal: 16,
        marginTop: 16, borderRadius: 14, paddingVertical: 15,
    },
    applyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});