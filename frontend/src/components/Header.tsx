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
        <header className="w-full z-50 transition-all duration-300 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* 1. SINGLE LOGO - Left Aligned */}
                <Link href="/" className="flex items-center group">
                    <div className="relative h-10 w-40 block transition-opacity hover:opacity-90">
                        <Image
                            src="/assets/meetbarter logo typo-02.png"
                            alt="Meetbarter"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </Link>


                {/* 2. Navigation Actions (Right Aligned) */}
                <nav className="flex items-center gap-4">
                    <Link href="/about" className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition-colors duration-200">How it Works</Link>
                    <Link href="/events" className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition-colors duration-200">Events</Link>
                    <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition-colors duration-200">Dashboard</Link>

                    {/* Dark/Light Mode Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
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

                    <div className="h-5 w-[1px] bg-gray-200 mx-2"></div>

                    <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-meetbarter-black hover:bg-gray-900 border border-gray-800 text-meetbarter-neon-blue font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group">
                        <svg className="w-4 h-4 text-meetbarter-neon-blue group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Get App
                    </button>

                    <Link href="/login" className="px-4 py-2 rounded-full bg-indigo-600 text-white font-semibold text-sm shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-300 active:scale-95">
                        Sign In / Join
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
