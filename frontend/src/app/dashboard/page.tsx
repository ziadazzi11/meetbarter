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
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600 mt-1">Manage your listings and trades</p>
                    </div>
                    <button
                        onClick={() => setIsPersonalizeOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                        <span>🎨 Personalize</span>
                    </button>
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
                                        <button
                                            onClick={openCreateModal}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            + Create Listing
                                        </button>
                                    )}
                                </div>

                                {myListings.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 mb-4">You haven&apos;t created any listings yet</p>
                                        <button
                                            onClick={openCreateModal}
                                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Create Your First Listing
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
                                                        <div className="flex gap-4 mt-2 items-center">
                                                            <span className="text-blue-600 font-bold">{listing.priceVP} VP</span>
                                                            <span className="text-gray-500">{listing.location}</span>
                                                            {/* Status Badge */}
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                                                ${listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input required className="w-full p-2 border rounded" value={listingFormData.title} onChange={e => setListingFormData({ ...listingFormData, title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea required className="w-full p-2 border rounded min-h-[100px]" value={listingFormData.description} onChange={e => setListingFormData({ ...listingFormData, description: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (Value)</label>
                                            <input type="number" required className="w-full p-2 border rounded" value={listingFormData.originalPrice} onChange={e => setListingFormData({ ...listingFormData, originalPrice: Number(e.target.value) })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                            <select className="w-full p-2 border rounded" value={listingFormData.condition} onChange={e => setListingFormData({ ...listingFormData, condition: e.target.value })}>
                                                <option value="NEW">New</option>
                                                <option value="USED_GOOD">Used - Good</option>
                                                <option value="USED_FAIR">Used - Fair</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                            <select required className="w-full p-2 border rounded" value={listingFormData.categoryId} onChange={e => setListingFormData({ ...listingFormData, categoryId: e.target.value })}>
                                                <option value="">Select Category</option>
                                                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input required className="w-full p-2 border rounded" value={listingFormData.location} onChange={e => setListingFormData({ ...listingFormData, location: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                                        <ImageUpload initialImages={listingFormData.images} onUpload={(urls) => setListingFormData({ ...listingFormData, images: urls })} maxImages={5} />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4">
                                        <button type="button" onClick={() => setIsListingModalOpen(false)} className="px-4 py-2 border rounded text-gray-600">Cancel</button>
                                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Save Listing</button>
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
