import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

export const registerUser = async (name, email, password, phone) => {
    try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        // Save user profile to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            name,
            email,
            phone,
            role: 'customer',
            createdAt: serverTimestamp(),
        });
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const loginUser = async (email, password) => {
    try {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};