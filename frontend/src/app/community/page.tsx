'use client';

import { Users, MessageSquare, Zap, Shield, Gift, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function CommunityPage() {
    // Note: Official Discord Invite Link
    const DISCORD_INVITE_LINK = "https://discord.gg/Jrwd2cJT";

    const benefits = [
        {
            icon: <Zap className="h-5 w-5 text-yellow-400" />,
            title: "Exclusive Drops",
            description: "Be the first to see high-value barter listings and special inventory releases."
        },
        {
            icon: <MessageSquare className="h-5 w-5 text-blue-400" />,
            title: "Fast Support",
            description: "Direct access to our moderation team and community leaders for instant help."
        },
        {
            icon: <Shield className="h-5 w-5 text-green-400" />,
            title: "Verified Trading",
            description: "Build your reputation and get 'Recognized Trader' status by engaging with the community."
        },
        {
            icon: <Gift className="h-5 w-5 text-pink-400" />,
            title: "Community Events",
            description: "Join weekly trading workshops, local meetups, and digital swap meets."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Hero Section */}
            <section className="relative py-20 px-4 bg-white border-b overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" /></pattern></defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-blue-100"
                    >
                        <Users className="h-4 w-4" />
                        Join 5,000+ Active Traders
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6"
                    >
                        The Heart of <span className="text-blue-600">Barter Commerce</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto"
                    >
                        Connect, network, and grow your reputation. Our community is where the most successful trades begin and trust is built.
                    </motion.p>
                </div>
            </section>

            <main className="max-w-6xl mx-auto py-16 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Benefits & Information */}
                    <div className="lg:col-span-7 space-y-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-8 text-slate-800">Why Join the Association?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {benefits.map((benefit, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ y: -5 }}
                                        className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 italic">
                                                {benefit.icon}
                                            </div>
                                            <h3 className="font-bold text-slate-900">{benefit.title}</h3>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            {benefit.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-4">Recognized Trader Status</h3>
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    Our community discord is the baseline for trust. Participate in discussions, verify your identity with moderators, and unlock the "Recognized Trader" badge on your profile.
                                </p>
                                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                    Learn about Verification
                                </Button>
                            </div>
                            <div className="absolute -right-8 -bottom-8 opacity-10">
                                <Shield className="h-48 w-48" />
                            </div>
                        </div>
                    </div>

                    {/* Right: Discord Integration Card */}
                    <div className="lg:col-span-5">
                        <Card className="sticky top-24 border-none shadow-2xl overflow-hidden rounded-[2rem]">
                            <div className="bg-[#5865F2] p-8 text-white relative">
                                <div className="absolute top-4 right-4 animate-pulse">
                                    <div className="h-2.5 w-2.5 bg-green-400 rounded-full ring-4 ring-green-400/20" />
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center p-3 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                                        <svg viewBox="0 0 127.14 96.36" className="w-full h-full fill-[#5865F2]">
                                            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.48,80.21h0A105.73,105.73,0,0,0,32.47,96.36,77.7,77.7,0,0,0,39.22,85.25,68.42,68.42,0,0,1,28.27,80a5.13,5.13,0,0,1,0-2.22,78.29,78.29,0,0,1,11-5.69,94.9,94.9,0,0,1,47.8,0,78.4,78.4,0,0,1,11,5.69,5.27,5.27,0,0,1,0,2.22,68.21,68.21,0,0,1-11,5.27,77.72,77.72,0,0,0,6.74,11.11,105.3,105.3,0,0,0,32-16.15h0C129.46,53.33,124.4,29.69,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,54,53,48.8,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.23,53,91,65.69,84.69,65.69Z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold">Discord Server</CardTitle>
                                        <CardDescription className="text-blue-100 flex items-center gap-2">
                                            Official Barter Hub
                                            <Badge variant="secondary" className="bg-white/20 text-white border-none text-[10px]">VERIFIED</Badge>
                                        </CardDescription>
                                    </div>
                                </div>
                                <h4 className="text-3xl font-extrabold mb-2">Connect Your World</h4>
                                <p className="text-blue-100 text-sm leading-relaxed mb-6 opacity-90">
                                    Join the real-time stream of barters, auctions, and direct negotiations.
                                </p>
                            </div>
                            <CardContent className="p-8 space-y-8 bg-white">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                                        <span className="font-medium text-slate-700">1,204 Online</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-slate-300 rounded-full" />
                                        <span className="text-slate-500">22,481 Members</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 group cursor-default">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold group-hover:scale-110 transition-transform">
                                            #
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Most Active Channel</p>
                                            <p className="font-bold text-slate-800">#live-barter-feed</p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-14 bg-[#5865F2] hover:bg-[#4752C4] text-white text-lg font-bold rounded-2xl shadow-xl shadow-blue-200 group"
                                    onClick={() => window.open(DISCORD_INVITE_LINK, '_blank')}
                                >
                                    Launch Discord Server
                                    <ExternalLink className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </Button>

                                <p className="text-[10px] text-center text-slate-400 uppercase tracking-[0.2em] font-bold">
                                    Secure Connection Protocol v2.4
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Bottom CTA */}
            <section className="bg-white py-20 px-4 border-t">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">Need immediate assistance?</h2>
                    <p className="text-slate-600 mb-10 max-w-xl mx-auto">
                        Our community managers are online and ready to help you navigate your first trades or handle complex swaps.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="h-12 px-8 bg-slate-900 text-white rounded-xl">
                            Help Center
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl group">
                            Contact Association
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
