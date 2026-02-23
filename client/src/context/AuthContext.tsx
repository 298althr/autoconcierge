'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

type User = {
    id: string;
    email: string;
    display_name: string;
    role: 'user' | 'admin';
    wallet_balance: number;
    kyc_status: 'none' | 'pending' | 'verified' | 'rejected';
    avatar_url?: string;
    phone?: string;
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<User>;
    register: (data: any) => Promise<User>;
    logout: () => void;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            setToken(savedToken);
            fetchUser(savedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    async function fetchUser(t: string) {
        try {
            const response = await apiFetch('/auth/me', { token: t });
            setUser(response.data);
        } catch (err) {
            console.error('Failed to fetch user', err);
            logout();
        } finally {
            setIsLoading(false);
        }
    }

    async function login(email: string, password: string) {
        const response = await apiFetch('/auth/login', {
            body: { email, password },
        });
        const { user, accessToken } = response;
        setUser(user);
        setToken(accessToken);
        localStorage.setItem('token', accessToken);
        return user;
    }

    async function register(data: any) {
        const response = await apiFetch('/auth/register', {
            body: data,
        });
        const { user, accessToken } = response.data;
        setUser(user);
        setToken(accessToken);
        localStorage.setItem('token', accessToken);
        return user;
    }

    function logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    }

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
