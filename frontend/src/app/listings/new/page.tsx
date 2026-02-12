"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/api";
import { adsClient } from "@/lib/ads-client";
import UpgradeModal from "@/components/UpgradeModal";
import ImageUpload from "@/components/ImageUpload";
import { useAuth } from "@/context/AuthContext";

export default function CreateListing() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [categories, setCategories] = useState<any[]>([]);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [listingType, setListingType] = useState("OFFER"); // OFFER | REQUEST
    const [expirationDuration, setExpirationDuration] = useState("NONE"); // 3, 7, 14, NONE
    const [condition, setCondition] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [location, setLocation] = useState("Beirut");
    const [country, setCountry] = useState("Lebanon");
    const [originType, setOriginType] = useState("PERSONAL_GIFT");
    const [authenticityStatus, setAuthenticityStatus] = useState("UNVERIFIED");
    const [isRefurbished, setIsRefurbished] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Hybrid Marketplace (Cash Options)
    const [priceCash, setPriceCash] = useState("");
    const [priceCurrency, setPriceCurrency] = useState("USD");

    // Storage Limits
    const [listingCount, setListingCount] = useState(0);
    const [listingLimit, setListingLimit] = useState(5);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/signup');
        }
    }, [user, loading, router]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/categories`)
            .then(res => res.json())
            .then(setCategories)
            .catch(console.error);

        if (user) {
            checkStorageLimits();
        }
    }, [user]);

    const checkStorageLimits = async () => {
        try {
            const userRes = await fetch(`${API_BASE_URL}/users/me`);
            const user = await userRes.json();

            let limit = 5;
            if (user.isBusiness) limit = 20;
            if (user.subscriptionTier === 'PREMIUM') limit = 1000;
            setListingLimit(limit);
        } catch (e) { console.error(e); }
    };

    const handleUpgrade = async () => {
        if (!user) return;
        await fetch(`${API_BASE_URL}/users/${user.id}/upgrade`, { method: 'PUT' });
        setIsUpgradeModalOpen(false);
        alert("Upgraded to Premium! You can now post unlimited items.");
        window.location.reload();
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        // Calculate Expiration
        let expiresAt = null;
        if (expirationDuration !== "NONE") {
            const days = parseInt(expirationDuration);
            const date = new Date();
            date.setDate(date.getDate() + days);
            expiresAt = date.toISOString();
        }

        const payload = {
            title,
            description,
            categoryId,
            listingType,
            condition,
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            originType,
            authenticityStatus,
            isRefurbished,
            images: JSON.stringify(images),
            location,
            country,
            sellerId: user?.id,
            expiresAt,
            priceCash: priceCash ? parseFloat(priceCash) : null,
            priceCurrency
        };

        try {
            await adsClient.post('/listings', payload);
            setTimeout(() => {
                alert("Listing Created Successfully!");
                router.push("/dashboard");
            }, 500);
        } catch (err: any) {
            setIsLoading(false);
            if (err.message.includes("Storage limit reached")) {
                setIsUpgradeModalOpen(true);
            } else {
                alert("Error creating listing: " + err.message);
            }
        }
    }

    if (loading || !user) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                        {listingType === 'OFFER' ? 'List an Item' : '🔍 Post a Request'}
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        {listingType === 'OFFER' ? 'Turn your unused items into Value Points.' : 'Let the community know what you are looking for.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">What would you like to do?</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                className={`
                                    relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200
                                    ${listingType === 'OFFER'
                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-gray-100'}
                                `}
                                onClick={() => setListingType('OFFER')}
                            >
                                <span className="font-bold">I'm Listing an Item</span>
                            </button>
                            <button
                                type="button"
                                className={`
                                    relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200
                                    ${listingType === 'REQUEST'
                                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-gray-100'}
                                `}
                                onClick={() => setListingType('REQUEST')}
                            >
                                <span className="text-3xl mb-2">🔍</span>
                                <span className="font-bold">I'm Looking For</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="listing-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                id="listing-title"
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder={listingType === 'OFFER' ? "e.g. Canon DSLR Camera 2020" : "e.g. Need Hiking Boots (Size 42)"}
                                required
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="listing-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                id="listing-category"
                                value={categoryId}
                                onChange={e => setCategoryId(e.target.value)}
                                required
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {listingType === 'OFFER' && (
                                <div>
                                    <label htmlFor="listing-condition" className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                    <select
                                        id="listing-condition"
                                        value={condition}
                                        onChange={e => setCondition(e.target.value)}
                                        required
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                    >
                                        <option value="">Select Condition</option>
                                        <option value="NEW">New (Sealed)</option>
                                        <option value="USED_GOOD">Used - Good</option>
                                        <option value="USED_FAIR">Used - Fair</option>
                                    </select>
                                </div>
                            )}
                            <div>
                                <label htmlFor="listing-price" className="block text-sm font-medium text-gray-700 mb-1">
                                    {listingType === 'OFFER' ? 'Reference Value (VP)' : 'Budget Range (VP)'}
                                    <span className="ml-1 text-xs text-gray-400 font-normal block">
                                        (Priced in Virtual Points. Free to barter.)
                                    </span>
                                </label>
                                <input
                                    id="listing-price"
                                    type="number"
                                    value={originalPrice}
                                    onChange={e => setOriginalPrice(e.target.value)}
                                    placeholder="e.g. 50"
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Hybrid Marketplace: Cash Price */}
                        <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                            <h3 className="text-sm font-bold text-green-800 mb-4 flex items-center">
                                <span className="mr-2 text-lg">💰</span> Hybrid Marketplace Options
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="cash-price" className="block text-sm font-medium text-green-700 mb-1">
                                        Cash Price (Optional)
                                        <span className="ml-1 text-xs text-green-600 block font-normal">
                                            Enable "Buy Now" for this item.
                                        </span>
                                    </label>
                                    <input
                                        id="cash-price"
                                        type="number"
                                        value={priceCash}
                                        onChange={e => setPriceCash(e.target.value)}
                                        placeholder="e.g. 100"
                                        className="block w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="listing-currency" className="block text-sm font-medium text-green-700 mb-1">Currency</label>
                                    <select
                                        id="listing-currency"
                                        value={priceCurrency}
                                        onChange={e => setPriceCurrency(e.target.value)}
                                        className="block w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="LBP">LBP (LL)</option>
                                    </select>
                                </div>
                            </div>
                            <p className="mt-3 text-xs text-green-700">
                                <strong>Note:</strong> Cash sales are subject to a small brokerage fee (2.5% or $1).
                            </p>
                        </div>

                        {listingType === 'OFFER' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                                <div>
                                    <label htmlFor="origin-type" className="block text-sm font-medium text-gray-700 mb-1">Origin Type</label>
                                    <select
                                        id="origin-type"
                                        value={originType}
                                        onChange={e => setOriginType(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                    >
                                        <option value="PERSONAL_GIFT">Personal / Gift</option>
                                        <option value="HANDMADE">Handmade / Craft</option>
                                        <option value="COMMERCIAL_INVENTORY">Commercial Inventory</option>
                                        <option value="LIQUIDATION">Liquidation / Clearance</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="authenticity-status" className="block text-sm font-medium text-gray-700 mb-1">Authenticity</label>
                                    <select
                                        id="authenticity-status"
                                        value={authenticityStatus}
                                        onChange={e => setAuthenticityStatus(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                    >
                                        <option value="UNVERIFIED">Not Verified</option>
                                        <option value="VERIFIED_ORIGINAL">Verified Original</option>
                                        <option value="REPLICA_DECLARED">Declared Replica</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 flex items-center">
                                    <input
                                        type="checkbox"
                                        id="refurbished"
                                        checked={isRefurbished}
                                        onChange={e => setIsRefurbished(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="refurbished" className="ml-2 block text-sm text-gray-900">
                                        This item is refurbished / repaired
                                    </label>
                                </div>
                            </div>
                        )}

                        {listingType === 'OFFER' && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h4 className="text-sm font-bold text-blue-800 mb-1">⚖️ MeetBarter Fair Value Protocol</h4>
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    Our system automatically calculates <strong>Value Points (VP)</strong> based on your Reference Value and item attributes.
                                    To prevent inflation and ensure fairness:
                                    <ul className="list-disc ml-4 mt-1 space-y-1">
                                        <li>Used items are capped at 85% of Reference Value.</li>
                                        <li>Declared replicas are capped at 40%.</li>
                                        <li>Refurbished items are capped at 60%.</li>
                                    </ul>
                                </p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="listing-description-main" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                id="listing-description-main"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={5}
                                required
                                placeholder="Describe the item in detail..."
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        {/* Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="listing-location" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    id="listing-location"
                                    type="text"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    required
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label htmlFor="listing-country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <input
                                    id="listing-country"
                                    type="text"
                                    value={country}
                                    onChange={e => setCountry(e.target.value)}
                                    required
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Optional Settings */}
                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Optional Settings</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="listing-duration" className="block text-sm font-medium text-gray-700 mb-1">Listing Duration</label>
                                    <select
                                        id="listing-duration"
                                        value={expirationDuration}
                                        onChange={e => setExpirationDuration(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                    >
                                        <option value="NONE">No Expiration (Standard)</option>
                                        <option value="3">3 Days (Urgent)</option>
                                        <option value="7">7 Days</option>
                                        <option value="14">14 Days</option>
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">Urgent listings get higher visibility.</p>
                                </div>
                            </div>
                        </div>

                        {/* INSTITUTIONAL PROHIBITION NOTICE */}
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-6">
                            <h4 className="text-sm font-bold text-red-800 mb-1">🚫 Institutional Prohibition Notice</h4>
                            <p className="text-xs text-red-700 leading-relaxed">
                                Meetbarter Lebanon strictly prohibits the listing of <strong>Firearms, Ammunition, Military-Grade Equipment, Weaponized Robotics, Narcotics, Prescription Drugs,</strong> or <strong>Medical Supplies</strong> requiring professional permits.
                                <br />
                                <span className="font-bold">Zero Tolerance:</span> Any attempt to list these items will result in an immediate block and permanent account suspension upon repeat offenses (Insistence Rule).
                            </p>
                        </div>

                        {/* Images */}
                        {listingType === 'OFFER' && (
                            <div className="pt-6 border-t border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Photos (Max 5)</label>
                                <ImageUpload
                                    initialImages={images}
                                    onUpload={(urls) => setImages(urls)}
                                    maxImages={5}
                                />
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`
                                px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5
                                ${isLoading ? 'opacity-70 cursor-wait' : ''}
                            `}
                        >
                            {isLoading ? 'Publishing...' : 'Publish Listing'}
                        </button>
                    </div>
                </form>

                <UpgradeModal
                    isOpen={isUpgradeModalOpen}
                    onClose={() => router.push('/dashboard')}
                    onUpgrade={handleUpgrade}
                    currentCount={listingCount}
                    limit={listingLimit}
                />
            </div>
        </div>
    );
}
