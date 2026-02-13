"use client";

import Link from "next/link";
import Image from "next/image";
import MapViewer from "./MapViewer/MapViewer";

interface HeroSplitProps {
    onPost: () => void;
    onRequest: () => void;
    isLoggedIn: boolean;
    listings?: any[];
}

export default function HeroSplit({ onPost, onRequest, isLoggedIn, listings = [] }: HeroSplitProps) {
    return (
        <section className="relative w-full min-h-[550px] flex flex-col md:flex-row bg-transparent overflow-hidden border-b border-[var(--glass-border)]">
            {/* Ambient Background Glows - Using meshes from globals.css + local accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[10%] w-[30%] h-[30%] bg-emerald-600/5 blur-[100px] rounded-full"></div>

            {/* Left Content - 55% */}
            <div className="w-full md:w-[55%] flex flex-col justify-center px-6 md:px-20 py-16 z-10 relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/10 w-fit mb-6 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Live Barter Network • Lebanon</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-[var(--text-main)] uppercase tracking-tighter leading-[0.9] mb-6">
                    TRADE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">EVERYTHING</span> <br />
                    OWN <span className="inline-block hover:scale-105 transition-transform duration-500 cursor-default">ANYTHING</span>
                </h1>

                <p className="text-lg md:text-xl text-[var(--text-muted)] mb-10 max-w-xl leading-relaxed">
                    The trust-first marketplace for modern trade.
                    <span className="text-[var(--text-main)] font-medium"> No intermediaries. No junk fees.</span> Just pure peer-to-peer exchange.
                </p>

                <div className="flex flex-col sm:flex-row gap-5">
                    <button
                        onClick={onPost}
                        className={`group relative px-8 py-5 font-black uppercase tracking-widest text-sm rounded-2xl transition-all duration-500 shadow-xl active:scale-95 overflow-hidden flex items-center justify-center min-w-[220px] ${isLoggedIn
                            ? "bg-[var(--text-main)] text-[var(--bg-app)] hover:bg-indigo-600 hover:text-white hover:shadow-indigo-500/40"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/40"
                            }`}
                    >
                        <span className="relative z-10">{isLoggedIn ? "Initiate Barter" : "Join Network"}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </button>

                    <button
                        onClick={onRequest}
                        className="px-8 py-5 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-main)] font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-[var(--mesh-glow)] hover:border-indigo-500/30 transition-all duration-300 backdrop-blur-md active:scale-95 flex items-center justify-center min-w-[220px]"
                    >
                        {isLoggedIn ? "Post Request" : "Explore Protocol"}
                    </button>
                </div>
            </div>

            {/* Right Image/Visual - 45% */}
            <div className="w-full md:w-[45%] relative min-h-[500px] md:h-auto overflow-hidden group flex items-center justify-center p-8">
                {/* Geometrical Decorative Shapes */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/5 rounded-full animate-[spin_20s_linear_infinite]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-white/5 rounded-full animate-[spin_35s_linear_infinite_reverse]"></div>
                </div>

                <div className="relative w-full h-full max-h-[600px] z-10 animate-float-premium perspective-1000">
                    <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-colors duration-700"></div>
                    <MapViewer
                        listings={listings || []}
                        className="h-full min-h-[450px] border-none shadow-2xl shadow-indigo-500/20 !rounded-[2.5rem]"
                    />
                </div>

                {/* Subtext info */}
                <div className="absolute bottom-8 right-12 text-right hidden lg:block pointer-events-none">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-50 mb-1">Live Map v2.0</div>
                    <div className="text-xs font-medium text-[var(--text-muted)] opacity-20">REAL-TIME ACTIVITY</div>
                </div>
            </div>
        </section>
    );
}
