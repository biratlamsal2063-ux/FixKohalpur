import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { COLORS } from '../../constants/colors';
import { globalStyles } from '../../styles/globalStyles';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function ReviewScreen({ route, navigation }) {
    const { bookingId, provider } = route.params;
    const { user } = useContext(AuthContext);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const submitReview = async () => {
        if (rating === 0) { Alert.alert('Error', 'Please select a star rating.'); return; }
        setLoading(true);
        try {
            // Add review document
            await addDoc(collection(db, 'reviews'), {
                bookingId,
                providerId: provider.id,
                userId: user.uid,
                rating,
                comment,
                createdAt: serverTimestamp(),
            });

            // Update provider's cumulative rating using Firestore increment
            const providerRef = doc(db, 'providers', provider.id);
            await updateDoc(providerRef, {
                ratingSum: increment(rating),
                reviewCount: increment(1),
                // rating (average) should be recomputed via Cloud Function
            });

            Alert.alert('Thank You! ⭐', 'Your review has been submitted.', [
                { text: 'Home', onPress: () => navigation.navigate('Home') },
            ]);
        } catch (e) {
            Alert.alert('Error', 'Could not submit review. Please try again.');
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Rate {provider.name}</Text>

            <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map(i => (
                    <TouchableOpacity key={i} onPress={() => setRating(i)}>
                        <Text style={[styles.star, i <= rating && styles.starActive]}>★</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TextInput
                style={[globalStyles.inputField, { height: 100 }]}
                placeholder="Share your experience..."
                multiline
                value={comment}
                onChangeText={setComment}
            />

            <TouchableOpacity
                style={[globalStyles.primaryButton, loading && { opacity: 0.7 }]}
                onPress={submitReview}
                disabled={loading}
            >
                <Text style={globalStyles.primaryButtonText}>{loading ? 'Submitting...' : 'Submit Review'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: COLORS.background },
    title: { fontSize: 20, fontWeight: '700', marginBottom: 20, color: COLORS.textPrimary, textAlign: 'center' },
    stars: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 8 },
    star: { fontSize: 42, color: COLORS.lightGray },
    starActive: { color: COLORS.accent },
});