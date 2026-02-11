'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { API_BASE_URL } from "@/config/api";
import ImageUpload from "@/components/ImageUpload";
import PersonalizationModal from "@/components/PersonalizationModal";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'listings' | 'trades' | 'wallet' | 'settings'>('listings');
    const [myListings, setMyListings] = useState<any[]>([]);
    const [pendingTrades, setPendingTrades] = useState<any[]>([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);

    // Theme States
    const [bannerUrl, setBannerUrl] = useState('');
    const [themeConfig, setThemeConfig] = useState<any>({});

    // Modal States
    const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
    const [isListingModalOpen, setIsListingModalOpen] = useState(false);
    const [editingListing, setEditingListing] = useState<any>(null); // If set, we are editing
    const [listingFormData, setListingFormData] = useState({
        title: '',
        description: '',
        location: '',
        country: 'Lebanon',
        categoryId: '',
        originalPrice: 0,
        condition: 'USED_GOOD',
        images: [] as string[]
    });
    const [categories, setCategories] = useState<any[]>([]);

    // Fetch User Data on Mount
    useEffect(() => {
        const uid = localStorage.getItem("meetbarter_uid");
        if (uid) {
            setUserId(uid);
            fetch(`${API_BASE_URL}/users/me`).then(res => res.json()).then(data => {
                if (data) {
                    setWalletBalance(data.walletBalance || 0);
                    if (data.bannerUrl) setBannerUrl(data.bannerUrl);
                    if (data.themePreferences) {
                        try {
                            const parsed = JSON.parse(data.themePreferences);
                            setThemeConfig((prev: any) => ({ ...prev, ...parsed }));
                        } catch (e) {
                            console.error("Error parsing theme", e);
                        }
                    }
                }
            });
            // Fetch Listings
            fetch(`${API_BASE_URL}/listings?sellerId=${uid}`).then(r => r.json()).then(setMyListings);
            // Fetch Trades (pending)
            fetch(`${API_BASE_URL}/trades?userId=${uid}`).then(r => r.json()).then(d => {
                setPendingTrades(d.filter((t: any) => t.status !== 'COMPLETED'));
            });
        }
        fetch(`${API_BASE_URL}/categories`).then(r => r.json()).then(setCategories);
    }, []);

    const openEditModal = (listing: any) => {
        setEditingListing(listing);
        let images = [];
        try { images = JSON.parse(listing.images); } catch { }

        setListingFormData({
            title: listing.title,
            description: listing.description,
            location: listing.location,
            country: listing.country || 'Lebanon', // Fallback if old data doesn't have country
            categoryId: listing.categoryId,
            originalPrice: listing.originalPrice,
            condition: listing.condition,
            images: images
        });
        setIsListingModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingListing(null);
        setListingFormData({
            title: '',
            description: '',
            location: '',
            country: 'Lebanon',
            categoryId: '',
            originalPrice: 0,
            condition: 'USED_GOOD',
            images: []
        });
        setIsListingModalOpen(true);
    };

    const handleSaveListing = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingListing
                ? `${API_BASE_URL}/listings/${editingListing.id}`
                : `${API_BASE_URL}/listings`;

            const method = editingListing ? 'PUT' : 'POST';

            const payload = {
                ...listingFormData,
                sellerId: userId,
                images: JSON.stringify(listingFormData.images),
                // Recalculate priceVP if logic needed, but backend handles it usually? 
                // For MVP let's assume backend recalculates or we trust frontend.
                // Assuming backend recalculates 'priceVP' based on 'originalPrice' and condition if logic exists there,
                // otherwise we might need to send priceVP. Checking backend seed implies backend calculates it? 
                // Actually seed calculates it. Let's send originalPrice and condition.
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(await res.text());

            alert(editingListing ? "Listing Updated!" : "Listing Created!");
            setIsListingModalOpen(false);
            // Refresh listings
            fetch(`${API_BASE_URL}/listings?sellerId=${userId}`).then(r => r.json()).then(setMyListings);

        } catch (error: any) {
            alert("Error: " + error.message);
        }
    };

    const handleToggleStatus = async (listingId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
        try {
            const res = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error(await res.text());

            // Refresh to update UI
            fetch(`${API_BASE_URL}/listings?sellerId=${userId}`).then(r => r.json()).then(setMyListings);
        } catch (error: any) {
            alert("Error updating status: " + error.message);
        }
    };



    return (
        <div className="min-h-screen bg-[var(--bg-app)] py-12 px-4 pt-32">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                            Operational Hub
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-[var(--text-main)] uppercase tracking-tight">Dashboard</h1>
                        <p className="text-[var(--text-muted)] mt-2 font-medium">Manage your listings and trade velocity.</p>
                    </div>
                    <button
                        onClick={() => setIsPersonalizeOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] hover:bg-[var(--mesh-glow)] transition-all shadow-xl shadow-indigo-500/5"
                    >
                        <span>🎨 Personalize</span>
                    </button>
                </div>

                {/* Navigation Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`p-8 rounded-3xl border font-black uppercase tracking-widest text-[10px] text-center transition-all duration-300 shadow-xl ${activeTab === 'listings'
                            ? 'bg-indigo-600 text-white border-indigo-600 scale-105 shadow-indigo-500/20'
                            : 'bg-[var(--glass-bg)] text-[var(--text-muted)] border-[var(--glass-border)] hover:border-indigo-500/30'
                            }`}
                    >
                        My Listings
                    </button>

                    <button
                        onClick={() => setActiveTab('trades')}
                        className={`p-8 rounded-3xl border font-black uppercase tracking-widest text-[10px] text-center transition-all duration-300 shadow-xl ${activeTab === 'trades'
                            ? 'bg-indigo-600 text-white border-indigo-600 scale-105 shadow-indigo-500/20'
                            : 'bg-[var(--glass-bg)] text-[var(--text-muted)] border-[var(--glass-border)] hover:border-indigo-500/30'
                            }`}
                    >
                        Pending Trades
                    </button>

                    <button
                        onClick={() => setActiveTab('wallet')}
                        className={`p-8 rounded-3xl border font-black uppercase tracking-widest text-[10px] text-center transition-all duration-300 shadow-xl ${activeTab === 'wallet'
                            ? 'bg-indigo-600 text-white border-indigo-600 scale-105 shadow-indigo-500/20'
                            : 'bg-[var(--glass-bg)] text-[var(--text-muted)] border-[var(--glass-border)] hover:border-indigo-500/30'
                            }`}
                    >
                        Wallet
                    </button>

                    <Link
                        href="/bounties"
                        className="p-8 rounded-3xl border font-black uppercase tracking-widest text-[10px] text-center transition-all duration-300 shadow-xl bg-[var(--glass-bg)] text-indigo-600 border-[var(--glass-border)] hover:border-indigo-500/30 flex items-center justify-center grayscale hover:grayscale-0"
                    >
                        Earn VP
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow mb-6">

                    <div className="p-6">
                        {/* My Listings Tab */}
                        {activeTab === 'listings' && (
                            <div className="bg-[var(--glass-bg)] p-10 rounded-2xl shadow-2xl border border-[var(--glass-border)] backdrop-blur-xl relative overflow-hidden">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 relative z-10">
                                    <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tight">Active Listings</h2>
                                    {myListings.length > 0 && (
                                        <button
                                            onClick={openCreateModal}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
                                        >
                                            + Create New
                                        </button>
                                    )}
                                </div>

                                {myListings.length === 0 ? (
                                    <div className="text-center py-20 border-2 border-dashed border-[var(--glass-border)] rounded-[2rem]">
                                        <p className="text-[var(--text-muted)] mb-6 font-black uppercase tracking-widest text-xs">No active inventory discovered</p>
                                        <button
                                            onClick={openCreateModal}
                                            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
                                        >
                                            Mint First Listing
                                        </button>
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
                                                        <div className="flex gap-4 mt-3 items-center">
                                                            <span className="text-indigo-600 dark:text-indigo-400 font-black tracking-tighter text-lg">{listing.priceVP.toLocaleString()} VP</span>
                                                            <span className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest opacity-60">📍 {listing.location}</span>
                                                            <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest
                                                                ${listing.status === 'ACTIVE' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-[var(--glass-bg)] text-[var(--text-muted)] border border-[var(--glass-border)]'}
                                                            `}>
                                                                {listing.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {/* Slot Swapping Logic */}
                                                        {listing.status === 'INACTIVE' && (
                                                            <button
                                                                onClick={() => handleToggleStatus(listing.id, 'ACTIVE')}
                                                                className="text-green-600 hover:underline text-sm font-bold bg-green-50 px-2 rounded"
                                                            >
                                                                Activate
                                                            </button>
                                                        )}
                                                        {listing.status === 'ACTIVE' && (
                                                            <button
                                                                onClick={() => handleToggleStatus(listing.id, 'INACTIVE')}
                                                                className="text-orange-600 hover:underline text-sm font-medium"
                                                            >
                                                                Deactivate
                                                            </button>
                                                        )}

                                                        <button onClick={() => openEditModal(listing)} className="text-blue-600 hover:underline text-sm font-medium">Edit</button>
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
                                                            className="px-4 py-2 bg-indigo-500/10 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all"
                                                        >
                                                            Inspect Trade
                                                        </Link>
                                                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all">
                                                            Accept
                                                        </button>
                                                        <button className="px-4 py-2 bg-[var(--text-muted)] text-[var(--bg-app)] rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all">
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
                            <div className="bg-[var(--glass-bg)] p-8 rounded-[2.5rem] border border-[var(--glass-border)] shadow-2xl backdrop-blur-md">
                                <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tight mb-8">Asset Liquidity</h2>
                                <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2rem] p-12 text-white mb-10 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-4">Total Available Capital</p>
                                        <div className="text-6xl md:text-7xl font-black tracking-tighter">{walletBalance.toLocaleString()} <span className="text-2xl opacity-50 font-medium">VP</span></div>
                                        <p className="text-xs font-medium opacity-60 mt-8 max-w-sm">
                                            Value Points are minted directly into your wallet upon mutual verification of trade completion.
                                        </p>
                                    </div>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
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

            {/* Personalization Modal */}
            <PersonalizationModal
                isOpen={isPersonalizeOpen}
                onClose={() => setIsPersonalizeOpen(false)}
            />

            {/* Edit/Create Listing Modal */}
            {
                isListingModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingListing ? 'Edit Listing' : 'Create New Listing'}</h2>
                                <form onSubmit={handleSaveListing} className="space-y-6">
                                    <div>
                                        <label htmlFor="listing-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input id="listing-title" required className="w-full p-2 border rounded" value={listingFormData.title} onChange={e => setListingFormData({ ...listingFormData, title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label htmlFor="listing-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea id="listing-description" required className="w-full p-2 border rounded min-h-[100px]" value={listingFormData.description} onChange={e => setListingFormData({ ...listingFormData, description: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="listing-original-price" className="block text-sm font-medium text-gray-700 mb-1">Original Price (Value)</label>
                                            <input id="listing-original-price" type="number" required className="w-full p-2 border rounded" value={listingFormData.originalPrice} onChange={e => setListingFormData({ ...listingFormData, originalPrice: Number(e.target.value) })} />
                                        </div>
                                        <div>
                                            <label htmlFor="listing-condition" className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                            <select id="listing-condition" className="w-full p-2 border rounded" value={listingFormData.condition} onChange={e => setListingFormData({ ...listingFormData, condition: e.target.value })}>
                                                <option value="NEW">New</option>
                                                <option value="USED_GOOD">Used - Good</option>
                                                <option value="USED_FAIR">Used - Fair</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="listing-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                            <select id="listing-category" required className="w-full p-2 border rounded" value={listingFormData.categoryId} onChange={e => setListingFormData({ ...listingFormData, categoryId: e.target.value })}>
                                                <option value="">Select Category</option>
                                                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="listing-location" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input id="listing-location" required className="w-full p-2 border rounded" value={listingFormData.location} onChange={e => setListingFormData({ ...listingFormData, location: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                                        <ImageUpload initialImages={listingFormData.images} onUpload={(urls) => setListingFormData({ ...listingFormData, images: urls })} maxImages={5} />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-6">
                                        <button type="button" onClick={() => setIsListingModalOpen(false)} className="px-6 py-3 border border-[var(--glass-border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--mesh-glow)] transition-all">Cancel</button>
                                        <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95">Save Asset</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
