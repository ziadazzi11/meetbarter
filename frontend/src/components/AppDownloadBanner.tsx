"use client";



export default function AppDownloadBanner() {
    return (
        <section className="bg-[var(--glass-bg)] py-16 px-4 md:px-8 border-t border-[var(--glass-border)] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-500/5 blur-[120px] -z-10"></div>

            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">

                {/* Text Content */}
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl md:text-5xl font-black text-[var(--text-main)] uppercase mb-4 tracking-tight">
                        Download the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">App</span>
                    </h2>
                    <p className="text-[var(--text-muted)] text-lg mb-8 max-w-lg">
                        Get the full Geomarketplace experience. Trade, chat, and verify deals instantly from your pocket.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        {/* App Store Button */}
                        <button className="flex items-center justify-center gap-3 bg-[var(--text-main)] text-[var(--bg-app)] px-6 py-3 rounded-2xl hover:opacity-90 transition-all duration-300 group shadow-xl shadow-black/5 active:scale-95 min-w-[200px]">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.68-.83 1.14-1.99 1.01-3.15-1.02.05-2.27.68-3.01 1.55-.65.76-1.22 1.97-1.06 3.19 1.14.09 2.3-.57 2.97-1.55z" /></svg>
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-black tracking-widest opacity-60">Download on the</div>
                                <div className="text-sm font-black leading-none">App Store</div>
                            </div>
                        </button>

                        {/* Google Play Button */}
                        <button className="flex items-center justify-center gap-3 bg-transparent border border-[var(--glass-border)] text-[var(--text-main)] px-6 py-3 rounded-2xl hover:bg-[var(--mesh-glow)] transition-all duration-300 active:scale-95 min-w-[200px]">
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.79,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M19.16,17.36L14.7,12.9L13.7,11.9L4.44,2.7C4.65,2.56 4.9,2.5 5.16,2.5L19.16,10.5C20.27,11.14 20.27,12.86 19.16,13.5L5.16,21.5C4.9,21.5 4.65,21.44 4.44,21.3L19.16,17.36M15.53,13.73L5.3,24C5.16,23.86 5,23.75 4.78,23.63L15.53,13.73M15.53,10.27L4.78,0.37C5,0.25 5.16,0.14 5.3,0L15.53,10.27Z" /></svg>
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-black tracking-widest opacity-60">Get it on</div>
                                <div className="text-sm font-black leading-none">Google Play</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* QR Code / Visual */}
                <div className="hidden md:block relative w-64 h-64 bg-[var(--bg-app)] p-4 rounded-[3rem] rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl border border-[var(--glass-border)]">
                    <div className="w-full h-full border-2 border-dashed border-[var(--glass-border)] rounded-[2.5rem] flex items-center justify-center">
                        <span className="text-[var(--text-muted)] opacity-30 font-black text-center text-xs tracking-widest">QR CODE<br />READY</span>
                    </div>
                    <div className="absolute -bottom-6 -right-6 bg-indigo-600 text-white font-black text-[10px] px-6 py-2.5 rounded-full uppercase tracking-[0.2em] animate-bounce shadow-xl shadow-indigo-500/30">
                        Scan Me
                    </div>
                </div>

            </div>
        </section>
    );
}
