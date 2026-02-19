"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
    trustScore?: number; // Added to match new design
    country?: string;
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

    useEffect(() => {
        // Check for token on mount
        const storedToken = localStorage.getItem("meetbarter_token");
        const storedUid = localStorage.getItem("meetbarter_uid");

        if (storedToken && storedUid) {
            setToken(storedToken);
            // Fetch user profile
            fetchUser(storedUid, storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (userId: string, authToken: string) => {
        try {
            // Logic to fetch user profile using the token
            // For now, assuming we have an endpoint or using the mock strategy from before but enforced with real headers
            const res = await apiClient.fetch(`${API_BASE_URL}/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                throw new Error("Session expired");
            }
        } catch (error) {
            console.error("Failed to restore session", error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, pass: string) => {
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
    };

    const signup = async (fullName: string, email: string, pass: string) => {
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
            // Assuming the backend returns similar structure on signup, or automatically logs in
            // If not auto-login, we might need to ask user to login or redirect
            // For now, let's assume we need to login separately or handle the response if it includes token
            if (data.access_token && data.user) {
                localStorage.setItem("meetbarter_token", data.access_token);
                localStorage.setItem("meetbarter_uid", data.user.id);
                setToken(data.access_token);
                setUser(data.user);
            } else {
                // If no token returned, maybe just success message and redirect to login
                // But for better UX, auto-login is preferred if possible.
                // If backend doesn't return token, we can call login() here
                await login(email, pass);
            }
        } catch (error) {
            console.error("Signup failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("meetbarter_token");
        localStorage.removeItem("meetbarter_uid");
        setUser(null);
        setToken(null);
        router.push("/login");
        toast.info("Logged out successfully");
    };

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
