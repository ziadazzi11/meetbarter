"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-100 mt-24 pb-12 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Centered Logo */}
                <div className="flex justify-center mb-8">
                    <div className="relative h-10 w-40 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <Image
                            src="/assets/logo-full.png"
                            alt="Meetbarter"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Primary Navigation */}
                <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-10 text-sm font-medium text-gray-500">
                    <Link href="/about" className="hover:text-indigo-600 transition-colors duration-200">About Us</Link>
                    <Link href="/ambassador" className="hover:text-indigo-600 transition-colors duration-200">Ambassadors</Link>
                    <Link href="/privacy" className="hover:text-indigo-600 transition-colors duration-200">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-indigo-600 transition-colors duration-200">Terms of Service</Link>
                </nav>

                {/* Divider */}
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-auto mb-8"></div>

                {/* Copyright & Info */}
                <div className="text-xs text-gray-400 space-y-3 font-light tracking-wide">
                    <p>
                        &copy; {new Date().getFullYear()} Meetbarter. All rights reserved.
                    </p>
                    <p className="flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Registered in Lebanon (Ministry of Economy). Built on Trust.
                    </p>
                </div>
            </div>
        </footer>
    );
}
