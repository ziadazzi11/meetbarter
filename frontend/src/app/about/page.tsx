/**
 * Copyright (c) 2026 Ziad Azzi. All Rights Reserved.
 */
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-app)]">
            {/* Hero Section */}
            <section className="relative py-24 bg-[var(--bg-app)] overflow-hidden border-b border-[var(--glass-border)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <div className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                            The Protocol
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black mb-6 text-[var(--text-main)] uppercase tracking-tight">
                            Barter Without <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-amber-500">Cash</span>.
                        </h1>
                        <p className="text-xl md:text-2xl text-[var(--text-muted)] max-w-3xl mx-auto mb-12 font-medium">
                            MeetBarter is a decentralized trust economy where your reputation is your currency.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-5">
                            <Link href="/signup" className="px-10 py-5 bg-indigo-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center min-w-[240px]">
                                Join the Network
                            </Link>
                            <Link href="#protocol" className="px-10 py-5 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-main)] font-black uppercase tracking-widest text-sm rounded-2xl backdrop-blur-md hover:bg-[var(--mesh-glow)] transition-all active:scale-95 flex items-center justify-center min-w-[240px]">
                                Learn the Protocol
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-indigo-500/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] bg-amber-500/10 rounded-full blur-[120px]"></div>
                </div>
            </section>

            {/* The Core Economic Unit (VP) */}
            <section id="vp" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div>
                            <div className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                                The Economic Backbone
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-[var(--text-main)] uppercase tracking-tight mb-6">What is a VP?</h2>
                            <p className="text-lg text-[var(--text-muted)] mb-8 leading-relaxed font-medium">
                                The <span className="text-indigo-600 font-black">Virtual Pointer (VP)</span> is MeetBarter's internal reference value. It allows users to trade items of different values without using traditional cash.
                            </p>
                            <ul className="space-y-6">
                                {[
                                    { title: 'Anti-Inflationary', desc: 'VP is only created ("minted") when a successful trade is verified by both parties.' },
                                    { title: 'Trust-Linked', desc: 'Your ability to hold and trade VP is bound by your Global Trust Score.' },
                                    { title: 'Secure Escrow', desc: '15% of the trade value is held in Operational Escrow until the meet-up is complete.' }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 group">
                                        <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 font-black transition-transform group-hover:scale-110">✓</div>
                                        <p className="text-[var(--text-muted)] font-medium">
                                            <span className="text-[var(--text-main)] font-black uppercase tracking-widest text-xs">{item.title}:</span> {item.desc}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-[var(--glass-bg)] p-10 rounded-[2rem] shadow-2xl border border-[var(--glass-border)] backdrop-blur-xl relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 relative z-10">
                                <span className="font-black text-[var(--text-muted)] uppercase tracking-[0.3em] text-[10px] opacity-50">VP Transaction Flow</span>
                                <span className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 whitespace-nowrap">Phase 4: Settlement</span>
                            </div>
                            <div className="space-y-8 relative z-10">
                                <div className="flex gap-6 items-center">
                                    <div className="w-14 h-14 rounded-2xl bg-[var(--mesh-glow)] flex items-center justify-center text-2xl shadow-inner">👤</div>
                                    <div className="flex-1 h-3 bg-indigo-500/10 rounded-full relative overflow-hidden">
                                        <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-amber-500 animate-pulse" style={{ width: '40%' }}></div>
                                    </div>
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-2xl text-white shadow-xl shadow-indigo-500/40 animate-bounce">💰</div>
                                    <div className="flex-1 h-3 bg-indigo-500/10 rounded-full"></div>
                                    <div className="w-14 h-14 rounded-2xl bg-[var(--mesh-glow)] flex items-center justify-center text-2xl shadow-inner">👤</div>
                                </div>
                                <div className="text-center text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] opacity-60">
                                    Mutual Verification Protocol
                                </div>
                            </div>
                            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px]"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The 4-Phase Protocol */}
            <section id="protocol" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--text-main)] uppercase tracking-tight mb-4">The MeetBarter Protocol</h2>
                        <p className="text-lg text-[var(--text-muted)] font-medium">Every trade follows a 4-phase security lifecycle.</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { phase: '01', title: 'Discovery', desc: 'Find items using our AI-pricing system to ensure fair value matches.' },
                            { phase: '02', title: 'Intent', desc: 'Secure an intention timestamp. Both parties commit to the trade terms.' },
                            { phase: '03', title: 'Fulfillment', desc: 'Meet in person. Inspect the goods. Use the secure in-app messaging.' },
                            { phase: '04', title: 'Settlement', desc: 'Verify the meet. VP is minted and transferred instantly to the seller.' },
                        ].map((p, idx) => (
                            <div key={idx} className="p-8 rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group flex flex-col items-center text-center backdrop-blur-sm">
                                <div className="mb-6 w-16 h-16 rounded-2xl bg-indigo-500/10 group-hover:bg-indigo-600 flex items-center justify-center transition-all duration-500 shadow-inner group-hover:shadow-indigo-500/40">
                                    <span className="text-2xl font-black text-indigo-600 group-hover:text-white transition-colors">{p.phase}</span>
                                </div>
                                <h3 className="text-xl font-black text-[var(--text-main)] mb-3 uppercase tracking-wide">{p.title}</h3>
                                <p className="text-[var(--text-muted)] text-sm leading-relaxed font-medium">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Engine */}
            <section id="trust" className="py-32 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black mb-6 text-[var(--text-main)] uppercase tracking-tight">A Zero-Trust Economy</h2>
                        <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto font-medium leading-relaxed">We don't expect you to trust strangers; we build systems that verify the data so you don't have to.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { icon: '📊', title: 'Global Trust Score', desc: 'Calculated based on trade history, verified reviews, and referral quality. Range: 1.0 to 5.0.' },
                            { icon: '👁️', title: 'Collusion Protection', desc: 'Our algorithm detects patterns of circular trading. Real value must change hands for scores to rise.' },
                            { icon: '🛡️', title: 'Privacy Masking', desc: 'In-app messaging automatically masks phone numbers and emails to keep trades secure.' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-[var(--glass-bg)] p-10 rounded-[2.5rem] border border-[var(--glass-border)] shadow-2xl hover:shadow-indigo-500/10 transition-all text-center space-y-4 group backdrop-blur-md flex flex-col items-center">
                                <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-wide">{item.title}</h3>
                                <p className="text-[var(--text-muted)] leading-relaxed font-medium">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-30">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]"></div>
                </div>
            </section>

            {/* T-Levels */}
            <section className="py-32">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black text-[var(--text-main)] uppercase tracking-tight mb-4">Trust Levels</h2>
                        <p className="text-lg text-[var(--text-muted)] font-medium uppercase tracking-widest text-xs opacity-60">The T-Protocol Hierarchy</p>
                    </div>
                    <div className="space-y-6">
                        {[
                            { level: 'T0: NEW', color: 'bg-indigo-500/20 text-indigo-600', desc: 'Recently joined. Full escrow required. Limited withdrawal velocity.' },
                            { level: 'T1: VERIFIED', color: 'bg-indigo-600 text-white', desc: 'Successful 5+ trades. Identity or business verification completed.' },
                            { level: 'T2: AMBASSADOR', color: 'bg-amber-500 text-white', desc: 'Trust leaders. They have voting power in the community and zero platform fees.' },
                            { level: 'T3: LEGEND', color: 'bg-[var(--text-main)] text-[var(--bg-app)]', desc: '1,000+ completed trades. These users act as community nodes and moderators.' },
                        ].map((t, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-8 p-8 rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:shadow-xl transition-all items-start md:items-center group backdrop-blur-sm">
                                <div className={`w-full md:w-56 h-14 ${t.color} rounded-2xl flex items-center justify-center font-black uppercase tracking-widest text-sm shadow-lg transition-transform group-hover:scale-105`}>
                                    {t.level}
                                </div>
                                <div className="flex-1 text-[var(--text-muted)] font-medium leading-relaxed">
                                    {t.desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-32 border-t border-[var(--glass-border)]">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-[var(--text-main)] mb-10 uppercase tracking-tight">Ready to trade?</h2>
                    <Link href="/" className="inline-block px-12 py-6 bg-indigo-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
                        Back to Marketplace
                    </Link>
                </div>
            </section>
        </div>
    );
}
