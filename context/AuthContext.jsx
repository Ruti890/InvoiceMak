'use client';

import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.msg || 'Login failed');
        }
        // Fetch updated user info
        const userRes = await fetch('/api/auth/me');
        if (userRes.ok) setUser(await userRes.json());
    };

    const register = async (name, email, password) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.msg || 'Registration failed');
        }

        // Check if the registration returned a session (verification off)
        // Note: Our API returns { msg: 'User registered successfully' }
        // We'll attempt a login only if we expect it to succeed.
        // If Supabase requires verification, the login attempt here would fail with "Email not confirmed".
        // Instead of blind login, let's inform the UI.

        try {
            await login(email, password);
            // If login succeeds, the user is redirected via UI logic or state change
            return { verified: true };
        } catch (err) {
            // If login fails with "Email not confirmed", we treat it as "Success but verification needed"
            if (err.message.includes('confirm') || err.message.includes('verified') || err.message.includes('credentials')) {
                return { verified: false };
            }
            throw err;
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/me', { method: 'POST' });
        } catch (e) {
            console.error('Logout error', e);
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
