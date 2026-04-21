import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const createBooking = async ({ userId, providerId, providerName, serviceType, date, timeSlot, notes, ratePerHour }) => {
    try {
        const bookingRef = await addDoc(collection(db, 'bookings'), {
            userId,
            providerId,
            providerName,
            serviceType,
            date,
            timeSlot,
            notes: notes || '',
            ratePerHour,
            status: 'pending',        // pending | confirmed | completed | cancelled
            paymentStatus: 'unpaid',  // unpaid | paid
            createdAt: serverTimestamp(),
        });
        return { success: true, bookingId: bookingRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateBookingStatus = async (bookingId, status) => {
    try {
        await updateDoc(doc(db, 'bookings', bookingId), { status });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};