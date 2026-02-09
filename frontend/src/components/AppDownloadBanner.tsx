"use client";

import Image from "next/image";

export default function AppDownloadBanner() {
    return (
        <section className="bg-meetbarter-black py-16 px-4 md:px-8 border-t border-gray-900">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">

                {/* Text Content */}
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase mb-4 tracking-tight">
                        Download the <span className="text-meetbarter-neon-blue">App</span>
                    </h2>
                    <p className="text-gray-400 text-lg mb-8 max-w-lg">
                        Get the full Geomarketplace experience. Trade, chat, and verify deals instantly from your pocket.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        {/* App Store Button */}
                        <button className="flex items-center gap-3 bg-white text-meetbarter-black px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors group">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.68-.83 1.14-1.99 1.01-3.15-1.02.05-2.27.68-3.01 1.55-.65.76-1.22 1.97-1.06 3.19 1.14.09 2.3-.57 2.97-1.55z" /></svg>
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Download on the</div>
                                <div className="text-sm font-bold leading-none">App Store</div>
                            </div>
                        </button>

                        {/* Google Play Button */}
                        <button className="flex items-center gap-3 bg-transparent border border-gray-700 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors">
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.79,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M19.16,17.36L14.7,12.9L13.7,11.9L4.44,2.7C4.65,2.56 4.9,2.5 5.16,2.5L19.16,10.5C20.27,11.14 20.27,12.86 19.16,13.5L5.16,21.5C4.9,21.5 4.65,21.44 4.44,21.3L19.16,17.36M15.53,13.73L5.3,24C5.16,23.86 5,23.75 4.78,23.63L15.53,13.73M15.53,10.27L4.78,0.37C5,0.25 5.16,0.14 5.3,0L15.53,10.27Z" /></svg>
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Get it on</div>
                                <div className="text-sm font-bold leading-none">Google Play</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* QR Code / Visual */}
                <div className="hidden md:block relative w-64 h-64 bg-white p-4 rounded-3xl rotate-3 hover:rotate-0 transition-transform duration-500 shadow-[0_0_40px_rgba(0,243,255,0.1)]">
                    <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center">
                        <span className="text-gray-300 font-bold text-center">QR CODE<br />PLACEHOLDER</span>
                        {/* Actual QR Code would go here */}
                    </div>
                    <div className="absolute -bottom-6 -right-6 bg-meetbarter-neon-blue text-meetbarter-black font-black text-xs px-4 py-2 rounded-full uppercase tracking-wide animate-bounce">
                        Scan Me
                    </div>
                </div>

            </div>
        </section>
    );
}
