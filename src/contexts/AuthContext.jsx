import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }
        try {
            const unsubscribe = onAuthStateChanged(auth, (u) => {
                setUser(u);
                setLoading(false);
            }, (err) => {
                console.error('Auth state error:', err);
                setLoading(false);
            });
            return unsubscribe;
        } catch (err) {
            console.error('Auth initialization error:', err);
            setLoading(false);
        }
    }, []);

    const login = (email, password) => {
        if (!auth) throw new Error('Firebase not configured');
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        if (!auth) return;
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
