import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

export var AuthContext = createContext();

export function AuthProvider(props) {
    var children = props.children;

    var userState = useState(null);
    var user = userState[0];
    var setUser = userState[1];

    var roleState = useState(null);
    var role = roleState[0];
    var setRole = roleState[1];

    var loadingState = useState(true);
    var loading = loadingState[0];
    var setLoading = loadingState[1];

    useEffect(function () {
        var unsubscribe = onAuthStateChanged(auth, async function (firebaseUser) {
            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    var snap = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (snap.exists()) {
                        var userData = snap.data();
                        setRole(userData.role || 'customer');
                    } else {
                        setRole('customer');
                    }
                } catch (e) {
                    console.error('AuthContext role fetch error:', e);
                    setRole('customer');
                }
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    var value = {
        user: user,
        role: role,
        loading: loading,
        isProvider: role === 'provider',
        isCustomer: role === 'customer',
    };

    return React.createElement(AuthContext.Provider, { value: value }, children);
}