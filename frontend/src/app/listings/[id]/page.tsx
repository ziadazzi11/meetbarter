"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ExpirationBadge from "@/components/ExpirationBadge";
import ActivityBadge from "@/components/ActivityBadge";
import BusinessBadge from "@/components/BusinessBadge";

export default function ListingDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);

    // DEMO USER ID - In production, use auth context
    const DEMO_USER_ID = "9d2c7649-9cf0-48fb-889a-1369e20615a6";

    useEffect(() => {
        if (!id) return;
        fetch(`http://localhost:3001/listings/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Listing not found");
                return res.json();
            })
            .then(data => {
                setListing(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        // Mock messages for now or fetch if API exists
        setMessages([]);
    }, [id]);

    const handleSendMessage = async (templateKey: string) => {
        if (!confirm("Send safe inquiry?")) return;

        try {
            await fetch('http://localhost:3001/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId: id,
                    senderId: DEMO_USER_ID,
                    receiverId: listing.sellerId,
                    templateKey,
                    content: `Inquiry about ${listing.title}`
                })
            });
            alert("Message Sent! The seller will be notified.");
            setIsInquiryModalOpen(false);
            // Optimistically add message
            setMessages(prev => [...prev, { id: Date.now(), senderId: DEMO_USER_ID, content: `Inquiry sent: ${templateKey}` }]);
        } catch (err) {
            alert("Failed to send message");
        }
    };

    const handleConfirm = async () => {
        if (!confirm(`CONFIRM TRADE for ${listing.priceVP} VP? \n\nThis will lock your funds in operational escrow.`)) return;

        try {
            const res = await fetch('http://localhost:3001/trades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId: id,
                    buyerId: DEMO_USER_ID,
                    sellerId: listing.sellerId,
                    offerVP: listing.priceVP
                })
            });

            if (!res.ok) throw new Error("Trade failed. Insufficient funds?");

            alert("Trade Confirmed! 🤝 \n\nFunds are strictly held in escrow until verification is complete.");
            router.push('/dashboard');
        } catch (err: any) {
            alert("Trade Error: " + err.message);
        }
    };

    if (loading) return <div className="loading-state">Loading Item Details...</div>;
    if (!listing) return <div className="loading-state">Item not found.</div>;

    const images = JSON.parse(listing.images || '[]');
    const sellerActivity = listing.seller?.activityMetric;

    return (
        <div className="listing-detail-container">
            <button onClick={() => router.back()} className="back-link">← Back to Market</button>

            <div className="listing-main-card">
                {/* ... hero image ... */}
                <div className="listing-hero-image">
                    {images[0] || 'No Image'}
                </div>

                <div className="listing-content">
                    <div className="listing-title-row">
                        <div className="flex flex-col gap-2">
                            <h1>{listing.title}</h1>
                            {listing.expiresAt && <ExpirationBadge expiresAt={listing.expiresAt} />}
                        </div>
                        {/* ... price info ... */}
                        <div className="listing-price-info">
                            <div className="listing-current-vp">{listing.priceVP} VP</div>
                            {listing.originalPrice && (
                                <div className="listing-was-vp">
                                    Was {listing.originalPrice} VP
                                </div>
                            )}
                            <div className="escrow-disclaimer">Operational Escrow Applies</div>
                        </div>
                    </div>

                    {/* ... description ... */}

                    <div className="seller-sidebar">
                        <div className="seller-info-label">SELLER INFORMATION</div>
                        <div className="text-bold" style={{ display: 'flex', alignItems: 'center' }}>
                            {listing.seller.fullName}
                            <BusinessBadge isBusiness={listing.seller.isBusiness} businessName={listing.seller.businessName} />
                        </div>
                        <div className="seller-sidebar-trust">Trust Score: <span className="text-green text-bold">{listing.seller.globalTrustScore}</span></div>

                        {/* Activity Badge */}
                        <div style={{ marginTop: 10 }}>
                            <ActivityBadge
                                variant="block"
                                lastSeenAt={sellerActivity?.lastSeenAt}
                                averageReplyHours={sellerActivity?.averageReplyHours}
                            />
                        </div>
                    </div>

                    {/* ... rest of the component ... */}

                    <div className="action-row" style={{ display: 'flex', gap: 15, marginTop: 20 }}>
                        <button
                            onClick={handleConfirm}
                            className="btn-purchase flex-1"
                        >
                            Confirm Purchase & Secure Escrow
                        </button>
                        <button
                            onClick={() => setIsInquiryModalOpen(true)}
                            className="btn-secondary"
                            style={{ padding: '0 25px', borderRadius: 8, border: '1px solid #d1d5db', backgroundColor: '#f9fafb' }}
                        >
                            💬 Safe Inquiry
                        </button>
                    </div>

                    {/* Chat History Snippet */}
                    {messages.length > 0 && (
                        <div className="message-history" style={{ marginTop: 30, padding: 15, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 10 }}>RECENT INQUIRIES</h3>
                            {messages.map((m: any) => (
                                <div key={m.id} style={{ fontSize: '0.85rem', marginBottom: 8, padding: '5px 0', borderBottom: '1px solid #edf2f7' }}>
                                    <span style={{ fontWeight: 'bold' }}>{m.senderId === DEMO_USER_ID ? 'You' : 'Seller'}:</span> {m.content}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="purchase-footer-text">
                        By confirming, {listing.priceVP} VP will be deducted from your administrative credits and held in secure operational escrow.
                        <br />
                        <span className="escrow-refund-note">
                            * Includes {listing.category?.escrowPercentage || 15}% Operational Escrow (Unused credits are automatically refunded after verification).
                        </span>
                    </div>
                </div>
            </div>

            {/* INQUIRY MODAL */}
            {isInquiryModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: 500 }}>
                        <h2 className="modal-title">🔐 Safe Inquiry Protocol</h2>
                        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: 20 }}>
                            To prevent fee circumvention and protect privacy, direct contact sharing is prohibited before escrow. Select a certified question:
                        </p>

                        <div className="template-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <button onClick={() => handleSendMessage('AVAILABILITY')} className="btn-template">Is this item still available?</button>
                            <button onClick={() => handleSendMessage('CONDITION')} className="btn-template">Confirm condition matches description?</button>
                            <button onClick={() => handleSendMessage('DETAIL_REQUEST')} className="btn-template">Request more history/details?</button>
                            <button onClick={() => handleSendMessage('PICKUP_COORD')} className="btn-template">Can we coordinate pickup via platform?</button>
                        </div>

                        <button onClick={() => setIsInquiryModalOpen(false)} className="btn-cancel" style={{ marginTop: 20, width: '100%' }}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
