'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type DashboardUser = {
    id: string;
    email: string;
    name: string;
};

type AuthContextType = {
    user: DashboardUser | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<DashboardUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('dashboard_auth_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        // Validate against allowed emails and password from env
        const allowedEmails = process.env.NEXT_PUBLIC_ALLOWED_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
        const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';

        if (!allowedEmails.includes(email)) {
            throw new Error('Email not authorized');
        }

        if (password !== adminPassword) {
            throw new Error('Invalid password');
        }

        const dashboardUser: DashboardUser = {
            id: 'admin_' + Math.random().toString(36).substr(2, 9),
            email,
            name: email.split('@')[0],
        };
        localStorage.setItem('dashboard_auth_user', JSON.stringify(dashboardUser));
        setUser(dashboardUser);
    };

    const logout = () => {
        localStorage.removeItem('dashboard_auth_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useDashboardAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useDashboardAuth must be used within AuthProvider');
    }
    return context;
}
