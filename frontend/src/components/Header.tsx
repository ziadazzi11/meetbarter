"use client";

import Link from "next/link";
import { useState } from "react";
// import { usePathname } from "next/navigation";

import Image from "next/image";
import PersonalizationModal from "./PersonalizationModal";

export default function Header() {
    const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);

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
                    <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition-colors duration-200">Dashboard</Link>

                    <button
                        onClick={() => setIsPersonalizeOpen(true)}
                        className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition-colors duration-200 flex items-center gap-1"
                    >
                        Personalize
                    </button>

                    <div className="h-5 w-[1px] bg-gray-200 mx-2"></div>

                    <Link href="/login" className="px-4 py-2 rounded-full bg-indigo-600 text-white font-semibold text-sm shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-300 active:scale-95">
                        Sign In / Join
                    </Link>
                </nav>
            </div>

            <PersonalizationModal
                isOpen={isPersonalizeOpen}
                onClose={() => setIsPersonalizeOpen(false)}
            />
        </header>
    );
}
