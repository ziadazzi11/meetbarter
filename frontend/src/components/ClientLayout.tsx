"use client";

import Header from "@/components/Header";
import ThemeManager from "@/components/ThemeManager";
import { ThemeProvider, useTheme } from "@/components/ThemeContext";

import RouteThemeController from "@/components/RouteThemeController";
import Footer from "@/components/Footer";
import VerificationGate from "@/components/VerificationGate";
// import { Geist, Geist_Mono } from "next/font/google";

// const geistSans = Geist({
//     variable: "--font-geist-sans",
//     subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//     variable: "--font-geist-mono",
//     subsets: ["latin"],
// });

import { ToastProvider, ToastContainer } from "@/context/ToastContext";

import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import ChatWidget from "@/components/Chat/ChatWidget";

import { Toaster } from "@/components/ui/sonner";

import { CurrencyProvider } from "@/context/CurrencyContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <CurrencyProvider>
                <AuthProvider>
                    <SocketProvider>
                        <ToastProvider>
                            <ThemedContent>{children}</ThemedContent>
                        </ToastProvider>
                    </SocketProvider>
                </AuthProvider>
            </CurrencyProvider>
        </ThemeProvider>
    );
}

function ThemedContent({ children }: { children: React.ReactNode }) {
    const { theme, darkMode } = useTheme();
    return (
        <body className={`flex flex-col min-h-screen theme-${theme} ${darkMode ? 'dark' : ''}`} suppressHydrationWarning={true}>
            <ToastContainer />
            <Toaster />
            <Header />
            <ThemeManager />
            <RouteThemeController />

            <ChatWidget />
            <div className="flex-grow">
                <VerificationGate>
                    {children}
                </VerificationGate>
            </div>
            <Footer />
        </body>
    );
}
