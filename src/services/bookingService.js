import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export async function createBooking(params) {
    var userId = params.userId;
    var providerId = params.providerId;
    var providerName = params.providerName;
    var providerPhone = params.providerPhone || '';
    var serviceType = params.serviceType;
    var date = params.date;
    var timeSlot = params.timeSlot;
    var notes = params.notes || '';
    var ratePerHour = params.ratePerHour;

    try {
        var ref = await addDoc(collection(db, 'bookings'), {
            userId: userId,
            providerId: providerId,
            providerName: providerName,
            providerPhone: providerPhone,
            serviceType: serviceType,
            date: date,
            timeSlot: timeSlot,
            notes: notes,
            ratePerHour: ratePerHour,
            status: 'pending',
            paymentStatus: 'unpaid',
            lastMessage: '',
            createdAt: serverTimestamp(),
        });
        return { success: true, bookingId: ref.id };
    } catch (error) {
        console.error('createBooking error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateBookingStatus(bookingId, status) {
    try {
        await updateDoc(doc(db, 'bookings', bookingId), { status: status });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}