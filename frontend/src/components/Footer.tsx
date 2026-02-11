"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "./ThemeContext";

export default function Footer() {
    const { darkMode } = useTheme();

    return (
        <footer className="bg-[var(--bg-app)] border-t border-[var(--glass-border)] mt-24 pb-12 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Centered Logo */}
                <div className="flex justify-center mb-8">
                    <div className="relative h-10 w-44 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <Image
                            src={darkMode ? "/assets/logo-full negative.png" : "/assets/logo-full.png"}
                            alt="Meetbarter"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Primary Navigation */}
                <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">
                    <Link href="/about" className="hover:text-indigo-600 transition-colors duration-200">About Us</Link>
                    <Link href="/ambassador" className="hover:text-indigo-600 transition-colors duration-200">Ambassadors</Link>
                    <Link href="/privacy" className="hover:text-indigo-600 transition-colors duration-200">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-indigo-600 transition-colors duration-200">Terms of Service</Link>
                </nav>

                {/* Social Media Links */}
                <div className="flex justify-center gap-6 mb-10">
                    <a href="https://www.instagram.com/meetbarter?igsh=cnhkbHJpOWp1ZnFq" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors" aria-label="Instagram">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                    </a>
                    <a href="https://www.facebook.com/share/1B2EC4CiF3/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" aria-label="Facebook">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
                    </a>
                    <a href="https://www.tiktok.com/@meetbarter?_r=1&_t=ZS-93l7iJJluI1" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors" aria-label="TikTok">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.03 5.91-.05 8.81-.4 9.9-14.98 12.25-18.3 5.36-1.61-3.34-1.32-8.37 2.05-11.39 3.06-2.73 8.16-2.3 10.97 1.47v4.54c-1.6-1.23-3.95-1.73-5.65.25-1.92 2.24-1.22 6.09 1.62 7.56 2.03 1.05 4.64.24 5.3-2.01.25-.86.26-1.78.26-2.67.01-6.64.01-13.28.02-19.92z" /></svg>
                    </a>
                </div>

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
