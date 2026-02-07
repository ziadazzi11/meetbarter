"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { adsClient } from "@/lib/ads-client";

interface User {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    subscriptionTier: string;
}

interface AuthContextType {
    user: User | null;
    login: (userId: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedId = localStorage.getItem("meetbarter_uid");
        if (storedId) {
            fetchUser(storedId);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (id: string) => {
        try {
            // Check if we have the endpoint, otherwise fallback to demo user for now if simple setup
            // In real app: GET /users/me or /users/:id
            const res = await adsClient.get(`/users/me`); // Assuming this exists or we use /users/:id
            // If /users/me isn't implemented, we might need to fetch by ID if we trust localStorage (weak security but MVP ok)
            // validating user existence
            if (res) {
                setUser(res as unknown as User);
            }
        } catch (error) {
            console.error("Failed to restore session", error);
            localStorage.removeItem("meetbarter_uid");
        } finally {
            setLoading(false);
        }
    };

    const login = async (userId: string) => {
        localStorage.setItem("meetbarter_uid", userId);
        await fetchUser(userId);
    };

    const logout = () => {
        localStorage.removeItem("meetbarter_uid");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
