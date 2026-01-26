'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ImageUpload from "@/components/ImageUpload";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'listings' | 'trades' | 'wallet' | 'settings'>('listings');
    const [myListings, setMyListings] = useState<any[]>([]);
    const [pendingTrades, setPendingTrades] = useState<any[]>([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);

    // Theme States
    const [bannerUrl, setBannerUrl] = useState('');
    const [themeConfig, setThemeConfig] = useState({
        font: 'Inter',
        cardColor: '#ffffff',
        textColor: '#1f2937',
        primaryColor: '#2563eb'
    });

    // Fetch User Data on Mount
    useEffect(() => {
        const uid = localStorage.getItem("meetbarter_uid");
        if (uid) {
            setUserId(uid);
            fetch(`http://localhost:3001/users/me`).then(res => res.json()).then(data => {
                if (data) {
                    setWalletBalance(data.walletBalance || 0);
                    if (data.bannerUrl) setBannerUrl(data.bannerUrl);
                    if (data.themePreferences) {
                        try {
                            const parsed = JSON.parse(data.themePreferences);
                            setThemeConfig(prev => ({ ...prev, ...parsed }));
                        } catch (e) {
                            console.error("Error parsing theme", e);
                        }
                    }
                }
            });
            // Fetch Listings
            fetch(`http://localhost:3001/listings?sellerId=${uid}`).then(r => r.json()).then(setMyListings);
            // Fetch Trades (pending)
            fetch(`http://localhost:3001/trades?userId=${uid}`).then(r => r.json()).then(d => {
                setPendingTrades(d.filter((t: any) => t.status !== 'COMPLETED'));
            });
        }
    }, []);

    const handleSaveTheme = async () => {
        if (!userId) return;
        try {
            const payload = {
                bannerUrl,
                themePreferences: JSON.stringify(themeConfig)
            };
            await fetch(`http://localhost:3001/users/${userId}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            alert("Theme Saved! Refresh to see changes.");
            window.location.reload(); // Simple reload to apply changes for now
        } catch (e) {
            alert("Failed to save theme");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage your listings and trades</p>
                </div>

                {/* Navigation Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`p-6 rounded-xl border font-bold text-center transition-all duration-200 shadow-sm hover:shadow-md ${activeTab === 'listings'
                            ? 'bg-indigo-600 text-white border-indigo-600 transform scale-[1.02]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                            }`}
                    >
                        My Listings
                    </button>

                    <button
                        onClick={() => setActiveTab('trades')}
                        className={`p-6 rounded-xl border font-bold text-center transition-all duration-200 shadow-sm hover:shadow-md ${activeTab === 'trades'
                            ? 'bg-indigo-600 text-white border-indigo-600 transform scale-[1.02]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                            }`}
                    >
                        Pending Trades
                    </button>

                    <button
                        onClick={() => setActiveTab('wallet')}
                        className={`p-6 rounded-xl border font-bold text-center transition-all duration-200 shadow-sm hover:shadow-md ${activeTab === 'wallet'
                            ? 'bg-indigo-600 text-white border-indigo-600 transform scale-[1.02]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                            }`}
                    >
                        Wallet
                    </button>

                    <Link
                        href="/bounties"
                        className="p-6 rounded-xl border font-bold text-center transition-all duration-200 shadow-sm hover:shadow-md bg-white text-indigo-600 border-gray-200 hover:border-indigo-300 flex items-center justify-center"
                    >
                        Earn VP
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow mb-6">

                    <div className="p-6">
                        {/* My Listings Tab */}
                        {activeTab === 'listings' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold">Your Active Listings</h2>
                                    {myListings.length > 0 && (
                                        <Link
                                            href="/listings/new"
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            + Create Listing
                                        </Link>
                                    )}
                                </div>

                                {myListings.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 mb-4">You haven&apos;t created any listings yet</p>
                                        <Link
                                            href="/listings/new"
                                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Create Your First Listing
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myListings.map((listing: any) => (
                                            <div
                                                key={listing.id}
                                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                                                        <p className="text-sm text-gray-600 mt-1">{listing.description}</p>
                                                        <div className="flex gap-4 mt-2">
                                                            <span className="text-blue-600 font-bold">{listing.priceVP} VP</span>
                                                            <span className="text-gray-500">{listing.location}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button className="text-blue-600 hover:underline text-sm">Edit</button>
                                                        <button className="text-red-600 hover:underline text-sm">Delete</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pending Trades Tab */}
                        {activeTab === 'trades' && (
                            <div>
                                <h2 className="text-xl font-semibold mb-6">Pending Trade Offers</h2>
                                {pendingTrades.length === 0 ? (
                                    <p className="text-gray-500 text-center py-12">No pending trades</p>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingTrades.map((trade: any) => (
                                            <div
                                                key={trade.id}
                                                className="border border-gray-200 rounded-lg p-4"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{trade.listingTitle}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            Offer: {trade.offerVP} VP by {trade.buyerName}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={`/trades/${trade.id}`}
                                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                                                        >
                                                            View Details
                                                        </Link>
                                                        <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                                                            Accept
                                                        </button>
                                                        <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Wallet Tab */}
                        {activeTab === 'wallet' && (
                            <div>
                                <h2 className="text-xl font-semibold mb-6">Your Wallet</h2>
                                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-8 text-white mb-6">
                                    <p className="text-sm opacity-90 mb-2">Administrative Credits</p>
                                    <div className="text-5xl font-bold">{walletBalance} VP</div>
                                    <p className="text-sm opacity-75 mt-4">
                                        Value Points earned through successful trades
                                    </p>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-6">
                                    <h3 className="font-semibold mb-4">Recent Transactions</h3>
                                    <p className="text-gray-500 text-center py-4">No recent transactions</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
