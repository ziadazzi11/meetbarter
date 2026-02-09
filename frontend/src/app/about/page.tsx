/**
 * Copyright (c) 2026 Ziad Azzi. All Rights Reserved.
 */
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-20 bg-indigo-600 text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Barter Without Cash.</h1>
                        <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto mb-10">
                            MeetBarter is a decentralized trust economy where your reputation is your currency.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/signup" className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-full shadow-xl hover:bg-gray-100 transition-all active:scale-95">
                                Join the Network
                            </Link>
                            <Link href="#protocol" className="px-8 py-4 bg-indigo-500 text-white font-bold rounded-full border border-indigo-400 hover:bg-indigo-400 transition-all active:scale-95">
                                Learn the Protocol
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] bg-indigo-400 rounded-full blur-3xl"></div>
                </div>
            </section>

            {/* The Core Economic Unit (VP) */}
            <section id="vp" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                                The Economic Backbone
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">What is a VP?</h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                The **Virtual Pointer (VP)** is MeetBarter's internal reference value. It allows users to trade items of different values without using traditional cash.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-1">✓</div>
                                    <p className="text-gray-700"><span className="font-bold">Anti-Inflationary:</span> VP is only created ("minted") when a successful trade is verified by both parties.</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-1">✓</div>
                                    <p className="text-gray-700"><span className="font-bold">Trust-Linked:</span> Your ability to hold and trade VP is bound by your Global Trust Score.</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-1">✓</div>
                                    <p className="text-gray-700"><span className="font-bold">Secure Escrow:</span> 15% of the trade value is held in Operational Escrow until the meet-up is complete.</p>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                            <div className="flex justify-between items-center mb-10">
                                <span className="font-bold text-gray-400 uppercase tracking-widest text-sm">VP Transaction Flow</span>
                                <span className="bg-indigo-600 text-white px-3 py-1 rounded text-xs">Phase 4: Settlement</span>
                            </div>
                            <div className="space-y-6">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">👤</div>
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full relative overflow-hidden">
                                        <div className="absolute left-0 top-0 h-full bg-indigo-600 animate-pulse" style={{ width: '40%' }}></div>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-xl text-white">💰</div>
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full"></div>
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">👤</div>
                                </div>
                                <div className="text-center text-sm font-medium text-gray-500">
                                    Funds move from Buyer to Seller only upon mutual QR/Verification.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The 4-Phase Protocol */}
            <section id="protocol" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">The MeetBarter Protocol</h2>
                        <p className="text-lg text-gray-600">Every trade follows a 4-phase security lifecycle.</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { phase: '01', title: 'Discovery', desc: 'Find items using our AI-pricing system to ensure fair value matches.' },
                            { phase: '02', title: 'Intent', desc: 'Secure an intention timestamp. Both parties commit to the trade terms.' },
                            { phase: '03', title: 'Fulfillment', desc: 'Meet in person. Inspect the goods. Use the secure in-app messaging.' },
                            { phase: '04', title: 'Settlement', desc: 'Verify the meet. VP is minted and transferred instantly to the seller.' },
                        ].map((p, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all group flex flex-col items-center text-center">
                                <div className="mb-4 w-16 h-16 rounded-full bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                                    <span className="text-2xl font-black text-indigo-600 group-hover:text-indigo-700">{p.phase}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{p.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Engine */}
            <section id="trust" className="py-24 bg-gradient-to-br from-indigo-50 to-white text-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-gray-900">A Zero-Trust Economy</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">We don't expect you to trust strangers; we build systems that verify the data so you don't have to.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center space-y-4 group">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform">📊</div>
                            <h3 className="text-2xl font-bold text-gray-900">Global Trust Score</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Calculated based on trade history, verified reviews, and referral quality. Range: 1.0 (New) to 5.0 (Legend).
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center space-y-4 group">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform">👁️</div>
                            <h3 className="text-2xl font-bold text-gray-900">Collusion Protection</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Our algorithm detects patterns of circular trading. Real value must change hands for scores to rise.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center space-y-4 group">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform">🛡️</div>
                            <h3 className="text-2xl font-bold text-gray-900">Privacy Masking</h3>
                            <p className="text-gray-600 leading-relaxed">
                                In-app messaging automatically masks phone numbers and emails to keep trades secure and on-platform.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* T-Levels */}
            <section className="py-24 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">Trust Levels (T-Protocol)</h2>
                    <div className="space-y-6">
                        {[
                            { level: 'T0: NEW', color: 'bg-gray-400', desc: 'Recently joined. Full escrow required. Limited withdrawal velocity.' },
                            { level: 'T1: VERIFIED', color: 'bg-blue-500', desc: 'Successful 5+ trades. Identity or business verification completed.' },
                            { level: 'T2: AMBASSADOR', color: 'bg-indigo-600', desc: 'Trust leaders. They have voting power in the community and zero platform fees.' },
                            { level: 'T3: LEGEND', color: 'bg-amber-500', desc: '1,000+ completed trades. These users act as community nodes and moderators.' },
                        ].map((t, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow items-start md:items-center">
                                <div className={`w-full md:w-48 h-auto min-h-[3rem] ${t.color} rounded-lg flex items-center justify-center text-white font-black whitespace-nowrap px-4 py-2 shadow-sm`}>
                                    {t.level}
                                </div>
                                <div className="flex-1 text-gray-600">
                                    {t.desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Ready to trade?</h2>
                    <Link href="/" className="inline-block px-10 py-4 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
                        Back to Marketplace
                    </Link>
                </div>
            </section>
        </div>
    );
}
