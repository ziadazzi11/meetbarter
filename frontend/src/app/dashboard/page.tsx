'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'listings' | 'trades' | 'wallet'>('listings');
    const [myListings, setMyListings] = useState<any[]>([]);
    const [pendingTrades, setPendingTrades] = useState<any[]>([]);
    const [walletBalance, setWalletBalance] = useState(0);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage your listings and trades</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex">
                            <button
                                onClick={() => setActiveTab('listings')}
                                className={`px-6 py-4 font-medium ${activeTab === 'listings'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                My Listings
                            </button>
                            <button
                                onClick={() => setActiveTab('trades')}
                                className={`px-6 py-4 font-medium ${activeTab === 'trades'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Pending Trades
                            </button>
                            <button
                                onClick={() => setActiveTab('wallet')}
                                className={`px-6 py-4 font-medium ${activeTab === 'wallet'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Wallet
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* My Listings Tab */}
                        {activeTab === 'listings' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold">Your Active Listings</h2>
                                    <Link
                                        href="/listings/new"
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        + Create Listing
                                    </Link>
                                </div>

                                {myListings.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 mb-4">You haven't created any listings yet</p>
                                        <Link
                                            href="/listings/new"
                                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Create Your First Listing
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myListings.map((listing) => (
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
                                        {pendingTrades.map((trade) => (
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
