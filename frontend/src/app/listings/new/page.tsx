"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UpgradeModal from "@/components/UpgradeModal";
import ImageUpload from "@/components/ImageUpload";

export default function CreateListing() {
    const router = useRouter();
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
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Storage Limits
    const [listingCount, setListingCount] = useState(0);
    const [listingLimit, setListingLimit] = useState(5);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    // DEMO USER ID (From seed)
    const DEMO_USER_ID = "9d2c7649-9cf0-48fb-889a-1369e20615a6";

    useEffect(() => {
        fetch("http://localhost:3001/categories")
            .then(res => res.json())
            .then(setCategories)
            .catch(console.error);

        checkStorageLimits();
    }, []);

    const checkStorageLimits = async () => {
        try {
            const userRes = await fetch("http://localhost:3001/users/me");
            const user = await userRes.json();

            let limit = 5;
            if (user.isBusiness) limit = 20;
            if (user.subscriptionTier === 'PREMIUM') limit = 1000;
            setListingLimit(limit);
        } catch (e) { console.error(e); }
    };

    const handleUpgrade = async () => {
        await fetch(`http://localhost:3001/users/${DEMO_USER_ID}/upgrade`, { method: 'PUT' });
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
            images: JSON.stringify(images),
            location,
            country,
            sellerId: DEMO_USER_ID,
            expiresAt
        };

        try {
            const res = await fetch("http://localhost:3001/listings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(await res.text());

            // Add a small delay for better UX
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder={listingType === 'OFFER' ? "e.g. Canon DSLR Camera 2020" : "e.g. Need Hiking Boots (Size 42)"}
                                required
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                    <select
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {listingType === 'OFFER' ? 'Reference Value (RV)' : 'Budget Range (RV)'}
                                    <span className="ml-1 text-xs text-gray-400 font-normal block">
                                        (Informational only. VP is minted upon trade completion.)
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    value={originalPrice}
                                    onChange={e => setOriginalPrice(e.target.value)}
                                    placeholder="e.g. 50"
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    required
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <input
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Listing Duration</label>
                                    <select
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
