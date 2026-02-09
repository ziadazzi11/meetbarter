"use client";

import Link from "next/link";
import Image from "next/image";

interface HeroSplitProps {
    onPost: () => void;
    onRequest: () => void;
}

export default function HeroSplit({ onPost, onRequest }: HeroSplitProps) {
    return (
        <section className="relative w-full min-h-[500px] flex flex-col md:flex-row bg-meetbarter-black overflow-hidden">
            {/* Left Content - 50% */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-16 py-12 z-10 relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-meetbarter-neon-blue blur-[80px] opacity-20"></div>

                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight mb-4">
                    BARTER <span className="text-meetbarter-neon-blue">NEARBY</span>
                </h1>

                <p className="text-lg text-gray-400 mb-8 max-w-md">
                    Exchange what you want with other users nearby.
                    <strong className="text-white"> Zero Commission. Zero Waste. Total Trust.</strong>
                </p>

                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={onPost}
                        className="px-8 py-4 bg-meetbarter-neon-blue text-meetbarter-black font-bold uppercase tracking-wide hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                    >
                        Start Barter
                    </button>
                    <button
                        onClick={onRequest}
                        className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold uppercase tracking-wide hover:bg-white hover:text-meetbarter-black hover:scale-105 transition-all"
                    >
                        Request Item
                    </button>
                </div>

                {/* Search Bar / Location (Mini) */}
                <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4 text-meetbarter-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span>Your Neighborhood in Your Pocket</span>
                </div>
            </div>

            {/* Right Image - 50% */}
            <div className="w-full md:w-1/2 relative bg-meetbarter-dark-gray h-[400px] md:h-auto overflow-hidden group">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black"></div>

                {/* Circle Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-meetbarter-neon-blue rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>

                {/* Floating Image (Placeholder for now, using a generic 'lifestyle' or abstract 3D element) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full max-w-md max-h-md animate-float">
                        <Image
                            src="/assets/xtribe_analysis_1770581509194.webp" // Using an existing artifact as placeholder if available, or just a logo
                            alt="Barter Lifestyle"
                            fill
                            className="object-cover md:object-contain opacity-80 mix-blend-overlay hover:mix-blend-normal transition-all duration-700"
                        />
                        {/* Fallback Text if image fails/is purely decorative */}
                        <div className="absolute inset-0 flex items-center justify-center text-meetbarter-dark-gray font-black text-9xl opacity-5 select-none uppercase">
                            Trade
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
