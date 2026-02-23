"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { API_BASE_URL } from "@/config/api";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    subscriptionTier?: string;
    phoneVerified?: boolean;
    isBusiness?: boolean;
    verificationLevel?: number;
    communityRole?: string;
    globalTrustScore?: number;
    walletBalance?: number;
    country?: string;
    totalTrades?: number;
    idCardStatus?: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED' | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, pass: string) => Promise<void>;
    signup: (fullName: string, email: string, pass: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const logout = useCallback(() => {
        localStorage.removeItem("meetbarter_token");
        localStorage.removeItem("meetbarter_uid");
        setUser(null);
        setToken(null);
        router.push("/login");
        toast.info("Logged out successfully");
    }, [router]);

    const fetchUser = useCallback(async (userId: string, authToken: string) => {
        try {
            const res = await apiClient.fetch(`${API_BASE_URL}/users/${userId}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${authToken}` }
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                throw new Error("Session expired");
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
            logout();
        } finally {
            setLoading(false);
        }
    }, [logout]);

    const exchangeCode = useCallback(async (code: string) => {
        try {
            const res = await apiClient.fetch(`${API_BASE_URL}/auth/exchange`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });

            if (res.ok) {
                const data = await res.json();
                const { access_token, user } = data;
                localStorage.setItem("meetbarter_token", access_token);
                localStorage.setItem("meetbarter_uid", user.id);
                setToken(access_token);
                setUser(user);
                toast.success("Social login successful!");
            } else {
                throw new Error("Failed to exchange login code");
            }
        } catch (error) {
            console.error("Exchange failed", error);
            toast.error("Login verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const handoverCode = urlParams.get("code");

        if (handoverCode) {
            exchangeCode(handoverCode);
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }

        const storedToken = localStorage.getItem("meetbarter_token");
        const storedUid = localStorage.getItem("meetbarter_uid");

        if (storedToken && storedUid) {
            setToken(storedToken);
            fetchUser(storedUid, storedToken);
        } else {
            setLoading(false);
        }
    }, [exchangeCode, fetchUser]);

    const login = useCallback(async (email: string, pass: string) => {
        try {
            const res = await apiClient.fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: pass }),
            });

            if (!res.ok) {
                throw new Error("Invalid credentials");
            }

            const data = await res.json();
            const { access_token, user } = data;

            if (access_token && user) {
                localStorage.setItem("meetbarter_token", access_token);
                localStorage.setItem("meetbarter_uid", user.id);
                setToken(access_token);
                setUser(user);
                toast.success("Welcome back!");
            }
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    }, []);

    const signup = useCallback(async (fullName: string, email: string, pass: string) => {
        try {
            const res = await apiClient.fetch(`${API_BASE_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName, email, password: pass }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Registration failed");
            }

            const data = await res.json();
            if (data.access_token && data.user) {
                localStorage.setItem("meetbarter_token", data.access_token);
                localStorage.setItem("meetbarter_uid", data.user.id);
                setToken(data.access_token);
                setUser(data.user);
            } else {
                await login(email, pass);
            }
        } catch (error) {
            console.error("Signup failed", error);
            throw error;
        }
    }, [login]);

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            signup,
            logout,
            loading,
            isAuthenticated: !!user
        }}>
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
