"use client";

import Link from "next/link";

// import { usePathname } from "next/navigation";

import Image from "next/image";
import { useTheme } from "./ThemeContext";
import { useAuth } from "@/context/AuthContext";
// import PersonalizationModal from "./PersonalizationModal";

export default function Header() {
    // const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
    const { darkMode, setDarkMode } = useTheme();
    const { user } = useAuth();

    return (
        <header className="w-full z-50 transition-all duration-300 bg-[var(--bg-app)]/80 backdrop-blur-md border-b border-[var(--glass-border)] sticky top-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* 1. SINGLE LOGO - Left Aligned */}
                <Link href="/" className="flex items-center group">
                    <div className="relative h-10 w-44 block transition-opacity hover:opacity-90">
                        <Image
                            src={darkMode ? "/assets/logo-alt negative.png" : "/assets/logo-alt.png"}
                            alt="Meetbarter"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </Link>


                {/* 2. Navigation Actions (Right Aligned) */}
                <nav className="flex items-center gap-4">
                    <Link href="/about" className="text-[var(--text-main)] hover:text-indigo-600 font-medium text-sm transition-colors duration-200 opacity-80 hover:opacity-100">How it Works</Link>
                    <Link href="/events" className="text-[var(--text-main)] hover:text-indigo-600 font-medium text-sm transition-colors duration-200 opacity-80 hover:opacity-100">Events</Link>
                    <Link href="/dashboard" className="text-[var(--text-main)] hover:text-indigo-600 font-medium text-sm transition-colors duration-200 opacity-80 hover:opacity-100">Dashboard</Link>

                    {/* Dark/Light Mode Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-full text-[var(--text-muted)] hover:bg-gray-500/10 transition-colors"
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {darkMode ? (
                            // Sun Icon (for Dark Mode)
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            // Moon Icon (for Light Mode)
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    <div className="h-5 w-[1px] bg-[var(--glass-border)] mx-2"></div>

                    <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--text-main)] hover:opacity-90 border border-[var(--glass-border)] text-[var(--bg-app)] font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 group">
                        <svg className="w-4 h-4 text-inherit group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Get App
                    </button>

                    <Link href="/signup" className="px-5 py-2.5 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-105 transition-all duration-300 active:scale-95">
                        Join MeetBarter
                    </Link>

                    {/* Bulk Upload Trigger - Businesses & Institutions & Farmers Only */}
                    {/* Access Rule: isBusiness=true OR verificationLevel >= 3 OR communityRole='FARMER' */}
                    {(user?.isBusiness || (user?.verificationLevel && user.verificationLevel >= 3) || user?.communityRole === 'FARMER') && (
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('openBulkUpload'))}
                            className="hidden md:block px-3 py-1 text-xs font-bold text-cyan-500 border border-cyan-500 rounded hover:bg-cyan-500 hover:text-black transition-colors"
                        >
                            BULK IMPORT
                        </button>
                    )}
                </nav>
            </div>


        </header>
    );
}
