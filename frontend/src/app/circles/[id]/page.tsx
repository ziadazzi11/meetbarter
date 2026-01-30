"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/api";
import Link from "next/link";
import "../circles.css"; // Reuse styles

export default function CircleDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [circle, setCircle] = useState<any>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const DEMO_USER_ID = "9d2c7649-9cf0-48fb-889a-1369e20615a6";

    const fetchCircleData = async () => {
        try {
            // Fetch Details
            const circleRes = await fetch(`${API_BASE_URL}/circles/${id}?userId=${DEMO_USER_ID}`);
            const circleData = await circleRes.json();
            setCircle(circleData);

            // Fetch Listings
            const listingsRes = await fetch(`${API_BASE_URL}/circles/${id}/listings?userId=${DEMO_USER_ID}`);
            const listingsData = await listingsRes.json();
            setListings(listingsData);

            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchCircleData();
    }, [id]);

    const handleJoin = async () => {
        try {
            await fetch(`${API_BASE_URL}/circles/${id}/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: DEMO_USER_ID })
            });
            fetchCircleData(); // Refresh to update membership status
            alert("Joined Circle!");
        } catch (error) {
            alert("Error joining circle");
        }
    };

    const handleLeave = async () => {
        if (!confirm("Are you sure you want to leave this circle?")) return;
        try {
            await fetch(`${API_BASE_URL}/circles/${id}/leave`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: DEMO_USER_ID })
            });
            fetchCircleData();
            alert("Left Circle");
        } catch (error) {
            alert("Error leaving circle");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Circle...</div>;
    if (!circle) return <div className="p-8 text-center text-red-500">Circle not found.</div>;

    const isMember = circle.members?.some((m: any) => m.userId === DEMO_USER_ID);

    return (
        <div className="circles-container">
            <button onClick={() => router.push('/circles')} style={{ marginBottom: 20, cursor: 'pointer', background: 'none', border: 'none', color: '#6b7280' }}>
                ← Back to All Circles
            </button>

            <div className="circle-header-detail" style={{ background: 'white', padding: 40, borderRadius: 16, marginBottom: 40, border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <div className={`circle-badge ${circle.isPublic ? 'public' : 'private'}`}>
                            {circle.isPublic ? '🌍 Public Group' : '🔒 Private Group'}
                        </div>
                        <h1 style={{ marginBottom: 10 }}>{circle.name}</h1>
                        <p style={{ fontSize: '1.1rem', color: '#4b5563', maxWidth: 600 }}>{circle.description}</p>
                    </div>
                    <div>
                        {!isMember ? (
                            <button onClick={handleJoin} className="btn-create">
                                Join Circle
                            </button>
                        ) : (
                            <button onClick={handleLeave} className="btn-cancel" style={{ background: '#fee2e2', color: '#991b1b', border: 'none' }}>
                                Leave Circle
                            </button>
                        )}
                    </div>
                </div>
                <div style={{ marginTop: 20, display: 'flex', gap: 20, color: '#6b7280' }}>
                    <span>👥 {circle.members?.length} members</span>
                    <span>📦 {listings.length} listings</span>
                </div>
            </div>

            {/* Exclusive Listings */}
            <h2 style={{ marginBottom: 20 }}>Circle Listings</h2>

            {listings.length > 0 ? (
                <div className="circles-grid">
                    {listings.map(listing => (
                        <div key={listing.id} className="circle-card">
                            <h3>{listing.title}</h3>
                            <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: 10 }}>{listing.priceVP} VP</div>
                            <p style={{ fontSize: '0.9rem', marginBottom: 20 }}>{listing.description.substring(0, 100)}...</p>
                            <Link href={`/listings/${listing.id}`} className="btn-view">
                                View Item
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ padding: 40, background: '#f9fafb', borderRadius: 12, textAlign: 'center', color: '#6b7280' }}>
                    No listings found in this circle yet. <br />
                    <Link href="/listings/new" style={{ color: '#3b82f6', fontWeight: 600, marginTop: 10, display: 'inline-block' }}>
                        + Post an Item here
                    </Link>
                </div>
            )}
        </div>
    );
}
