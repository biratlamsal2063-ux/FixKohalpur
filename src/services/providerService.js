import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const fetchProviders = async (serviceType = null) => {
    try {
        const providersRef = collection(db, 'providers');

        // Simple query — only filter by verified, no orderBy (avoids composite index)
        const q = serviceType
            ? query(providersRef, where('isVerified', '==', true), where('serviceType', '==', serviceType))
            : query(providersRef, where('isVerified', '==', true));

        const snapshot = await getDocs(q);
        const providers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort by rating on the client side instead (no index needed)
        return providers.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    } catch (error) {
        console.error('fetchProviders error:', error);
        return [];
    }
};