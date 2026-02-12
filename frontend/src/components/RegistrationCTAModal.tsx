"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface RegistrationCTAModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RegistrationCTAModal({ isOpen, onClose }: RegistrationCTAModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [isOpen]);

    if (!isOpen && !isVisible) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className={`relative w-full max-w-2xl bg-[#0a0a0b] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)] transition-all duration-500 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>

                {/* Animated Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] animate-pulse" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] animate-pulse delay-1000" />
                </div>

                <div className="relative p-8 md:p-12 flex flex-col items-center text-center">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-white/30 hover:text-white transition-colors"
                        aria-label="Close"
                        title="Close"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Icon/Badge */}
                    <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-600/40 transform rotate-12">
                        <svg className="w-10 h-10 text-white -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        Unlock the <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">Future of Trade</span>
                    </h2>

                    <p className="text-gray-400 text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
                        Join MeetBarter today and access a trust-based ecosystem where community value drives real impact.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-12">
                        {[
                            { label: 'Gamified Experience', icon: '🎮', color: 'indigo' },
                            { label: 'Trust-Based Network', icon: '🛡️', color: 'emerald' },
                            { label: 'Asset Marketplace', icon: '📦', color: 'violet' }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center">
                                <span className="text-2xl mb-2">{feature.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{feature.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <Link
                            href="/signup"
                            className="flex-1 px-8 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-indigo-600/30 text-center"
                        >
                            Start Your Journey
                        </Link>
                        <button
                            onClick={onClose}
                            className="px-8 py-5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl transition-all border border-white/10 text-center"
                        >
                            Maybe Later
                        </button>
                    </div>

                    <p className="mt-8 text-[10px] text-white/30 uppercase tracking-[0.3em] font-medium">
                        Join 5,000+ members in our trusted global circle
                    </p>
                </div>
            </div>
        </div>
    );
}
