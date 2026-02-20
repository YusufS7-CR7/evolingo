import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';


export type User = {
    id: number;
    email: string;
    name: string;
    level: string;
    xp: number;
    coins: number;
    streak: number;
    lastLogin?: string;
    age?: string;
    goal?: string;
    hearts: number;
    isPro: boolean;
    avatarUrl?: string;
    lastHeartReset: string;
    completedLessons?: string[];
    progress?: { lessonId: string; score: number }[];
    streakFreezes?: number;
    streakRepairs?: number;
    oldStreak?: number;
    lastStreakLostAt?: string;
    lastRepairUsedAt?: string;
};

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await authApi.getMe();
            setUser(response.data);
        } catch (error) {
            console.error('Auth check failed', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (data: any) => {
        const response = await authApi.login(data);
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
    };

    const register = async (data: any) => {
        const response = await authApi.register(data);
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateUser = (updates: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...updates } : null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateUser }}>
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
