"use client";

import Header from "@/components/Header";
import ThemeManager from "@/components/ThemeManager";
import { ThemeProvider, useTheme } from "@/components/ThemeContext";
import SacredGeometryOverlay from "@/components/SacredGeometryOverlay";
import RouteThemeController from "@/components/RouteThemeController";
import Footer from "@/components/Footer";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

import { AudioProvider } from "@/components/AudioContext";
import { ToastProvider, ToastContainer } from "@/context/ToastContext";
import BackgroundAudio from "@/components/BackgroundAudio";

import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import ChatWidget from "@/components/Chat/ChatWidget";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AudioProvider>
                    <SocketProvider>
                        <ToastProvider>
                            <ThemedContent>{children}</ThemedContent>
                        </ToastProvider>
                    </SocketProvider>
                </AudioProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

function ThemedContent({ children }: { children: React.ReactNode }) {
    const { theme, darkMode } = useTheme();
    return (
        <body className={`${geistSans.variable} ${geistMono.variable} flex flex-col min-h-screen theme-${theme} ${darkMode ? 'dark' : ''}`} suppressHydrationWarning={true}>
            <ToastContainer />
            <Header />
            <ThemeManager />
            <RouteThemeController />
            <BackgroundAudio />
            <SacredGeometryOverlay />
            <ChatWidget />
            <div className="flex-grow">
                {children}
            </div>
            <Footer />
        </body>
    );
}
