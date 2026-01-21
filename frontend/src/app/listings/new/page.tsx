"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./new-listing.css";
import UpgradeModal from "@/components/UpgradeModal";

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
            // In a real app, these should be robust endpoints.
            // For MVP, we mock the check or rely on the backend error, 
            // but let's pre-fetch limit just for UI (simulated)
            const userRes = await fetch("http://localhost:3001/users/me");
            const user = await userRes.json();

            let limit = 5;
            if (user.isBusiness) limit = 20;
            if (user.subscriptionTier === 'PREMIUM') limit = 1000;
            setListingLimit(limit);

            // Mock count fetch - usually count endpoint
            // setListingCount(data.count) 
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

            alert("Listing Created Successfully!");
            router.push("/dashboard");
        } catch (err: any) {
            if (err.message.includes("Storage limit reached")) {
                setIsUpgradeModalOpen(true);
            } else {
                alert("Error creating listing: " + err.message);
            }
        }
    }

    return (
        <div className="create-listing-container">
            <h1 className="page-title">Create New Listing</h1>

            <form onSubmit={handleSubmit} className="listing-form">
                {/* Type Selection */}
                <div className="form-section">
                    <label>Listing Type</label>
                    <div className="type-selector">
                        <button
                            type="button"
                            className={`type-btn ${listingType === 'OFFER' ? 'active' : ''}`}
                            onClick={() => setListingType('OFFER')}
                        >
                            📦 I'm Offering Item
                        </button>
                        <button
                            type="button"
                            className={`type-btn ${listingType === 'REQUEST' ? 'active' : ''}`}
                            onClick={() => setListingType('REQUEST')}
                        >
                            🔍 I'm Looking For
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder={listingType === 'OFFER' ? "e.g. Vintage Camera" : "e.g. Need Hiking Boots"}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {listingType === 'OFFER' && (
                    <div className="form-row">
                        <div className="form-group half">
                            <label>Condition</label>
                            <select value={condition} onChange={e => setCondition(e.target.value)} required>
                                <option value="">Select Condition</option>
                                <option value="NEW">New (Sealed)</option>
                                <option value="USED_GOOD">Used - Good</option>
                                <option value="USED_FAIR">Used - Fair</option>
                            </select>
                        </div>
                        <div className="form-group half">
                            <label>Original Market Value (VP estimate)</label>
                            <input
                                type="number"
                                value={originalPrice}
                                onChange={e => setOriginalPrice(e.target.value)}
                                placeholder="e.g. 50"
                            />
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={5}
                        required
                    />
                </div>

                {/* Expiration Section */}
                <div className="form-group">
                    <label>Listing Duration (Time-Limited)</label>
                    <select value={expirationDuration} onChange={e => setExpirationDuration(e.target.value)}>
                        <option value="NONE">No Expiration (Standard)</option>
                        <option value="3">3 Days (Urgent)</option>
                        <option value="7">7 Days</option>
                        <option value="14">14 Days</option>
                    </select>
                    <p className="hint">Time-limited listings get a special badge and higher visibility urgency.</p>
                </div>

                {/* Simplified Image Input for MVP */}
                <div className="form-group">
                    <label>Image URL (Optional)</label>
                    <input
                        type="text"
                        placeholder="http://..."
                        onBlur={e => e.target.value && setImages([e.target.value])}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group half">
                        <label>City</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} required />
                    </div>
                    <div className="form-group half">
                        <label>Country</label>
                        <input type="text" value={country} onChange={e => setCountry(e.target.value)} required />
                    </div>
                </div>

                <button type="submit" className="btn-submit">
                    Publish {listingType === 'OFFER' ? 'Listing' : 'Request'}
                </button>
            </form>

            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => router.push('/dashboard')}
                onUpgrade={handleUpgrade}
                currentCount={listingCount}
                limit={listingLimit}
            />
        </div>
    );
}
