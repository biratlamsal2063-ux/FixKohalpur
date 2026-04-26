import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export async function fetchProviders(serviceType) {
    try {
        var providersRef = collection(db, 'providers');

        var q;
        if (serviceType && serviceType !== 'all') {
            q = query(providersRef, where('serviceType', '==', serviceType));
        } else {
            q = query(providersRef);
        }

        var snapshot = await getDocs(q);
        var providers = snapshot.docs.map(function (d) {
            return Object.assign({ id: d.id }, d.data());
        });

        providers.sort(function (a, b) {
            return (b.rating || 0) - (a.rating || 0);
        });

        return providers;
    } catch (error) {
        console.error('fetchProviders error:', error);
        return [];
    }
}

export async function fetchProviderById(providerId) {
    try {
        var snap = await getDoc(doc(db, 'providers', providerId));
        if (snap.exists()) {
            return Object.assign({ id: snap.id }, snap.data());
        }
        return null;
    } catch (error) {
        console.error('fetchProviderById error:', error);
        return null;
    }
}