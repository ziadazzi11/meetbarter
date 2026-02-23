"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/api";
import Link from "next/link";
import ExpirationBadge from "@/components/ExpirationBadge";
import ActivityBadge from "@/components/ActivityBadge";
import BusinessBadge from "@/components/BusinessBadge";
import { UserIdentityBadge } from "@/components/UserIdentityBadge";

export default function ListingDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const uid = localStorage.getItem("meetbarter_uid");
        setCurrentUserId(uid);

        if (!id) return;
        fetch(`${API_BASE_URL}/listings/${id}`)
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

        // Mock messages for now
        setMessages([]);
    }, [id]);

    const handleSendMessage = async (templateKey: string) => {
        if (!currentUserId) {
            alert("Please login to send messages.");
            router.push('/login');
            return;
        }

        if (!confirm("Send safe inquiry?")) return;

        try {
            await fetch(`${API_BASE_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId: id,
                    senderId: currentUserId,
                    receiverId: listing.sellerId,
                    templateKey,
                    content: `Inquiry about ${listing.title}`
                })
            });
            alert("Message Sent! The seller will be notified.");
            setIsInquiryModalOpen(false);
            // Optimistically add message
            setMessages(prev => [...prev, { id: Date.now(), senderId: currentUserId, content: `Inquiry sent: ${templateKey}` }]);
        } catch (err) {
            alert("Failed to send message");
        }
    };

    const handleConfirm = async () => {
        if (!currentUserId) {
            alert("Please login to trade.");
            router.push('/login');
            return;
        }

        if (!confirm(`REQUEST TRADE for ${listing.priceVP} VP ?\n\nThis will lock your funds in operational escrow.`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/trades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId: id,
                    buyerId: currentUserId,
                    sellerId: listing.sellerId,
                    offerVP: listing.priceVP
                })
            });

            if (!res.ok) throw new Error("Trade failed. Insufficient funds?");

            alert("Trade Requested! 🤝 \n\nFunds are strictly held in escrow until verification is complete.");
            router.push('/dashboard');
        } catch (err: any) {
            alert("Trade Error: " + err.message);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Item Details...</div>;
    if (!listing) return <div className="p-8 text-center text-gray-500">Item not found.</div>;

    const images = JSON.parse(listing.images || '[]');
    const sellerActivity = listing.seller?.activityMetric;

    return (
        <div className="max-w-4xl mx-auto p-4 pb-20">
            <button onClick={() => router.back()} className="mb-6 text-gray-500 hover:text-gray-900 transition-colors font-medium">← Back to Market</button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Hero Image */}
                <div className="h-64 sm:h-80 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                    {images[0] ? (
                        <img src={images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-gray-400 font-medium">No Image Available</div>
                    )}
                </div>

                <div className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{listing.title}</h1>
                            {listing.expiresAt && <ExpirationBadge expiresAt={listing.expiresAt} />}
                        </div>

                        <div className="text-left sm:text-right">
                            <div className="text-3xl font-extrabold text-indigo-600">{listing.priceVP} VP</div>
                            {listing.originalPrice && (
                                <div className="text-sm text-gray-500">
                                    Reference Value: {listing.originalPrice} VP
                                </div>
                            )}
                            <div className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block mt-1">Operational Escrow Applies</div>
                        </div>
                    </div>

                    <div className="prose text-gray-600 mb-8 border-t border-gray-100 pt-6">
                        <p className="whitespace-pre-line">{listing.description}</p>
                        <div className="mt-4 flex flex-wrap gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <span className="font-semibold text-gray-700">Condition: <span className="font-normal text-gray-600">{listing.condition}</span></span>
                            <span className="font-semibold text-gray-700">Origin: <span className="font-normal text-gray-600">{listing.originType || 'Standard'}</span></span>
                            <span className="font-semibold text-gray-700">Authenticity: <span className="font-normal text-gray-600">{listing.authenticityStatus || 'Unverified'}</span></span>
                            <span className="font-semibold text-gray-700">Location: <span className="font-normal text-gray-600">{listing.location}</span></span>
                            {listing.isRefurbished && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Refurbished</span>
                            )}
                        </div>

                        <div className="mt-4 p-3 bg-indigo-50 rounded-lg border-indigo-100">
                            <p className="text-[11px] text-indigo-700 leading-tight">
                                <strong>Valuation Notice:</strong> This item's <strong>{listing.priceVP} VP</strong> value is algorithmically verified against market Reference Values, condition, and origin to ensure a fair and non-inflationary barter economy.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Seller Information</div>
                        <UserIdentityBadge
                            user={{
                                id: listing.sellerId,
                                fullName: listing.seller.fullName,
                                globalTrustScore: listing.seller.globalTrustScore || 0,
                                completedTrades: listing.seller._count?.sellerTrades + listing.seller._count?.buyerTrades || 0,
                                country: listing.seller.country,
                                userAchievements: listing.seller.userAchievements
                            }}
                            size="md"
                        />
                        <div className="mt-4">
                            <ActivityBadge
                                variant="block"
                                lastSeenAt={sellerActivity?.lastSeenAt}
                                averageReplyHours={sellerActivity?.averageReplyHours}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button
                            onClick={handleConfirm}
                            className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all active:scale-[0.98]"
                        >
                            Request Trade & Secure Escrow
                        </button>
                        <button
                            onClick={() => setIsInquiryModalOpen(true)}
                            className="px-6 py-4 bg-white text-gray-700 font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
                        >
                            💬 Safe Inquiry
                        </button>
                    </div>

                    {/* Chat History Snippet */}
                    {messages.length > 0 && (
                        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 mb-3">RECENT INQUIRIES</h3>
                            {messages.map((m: any) => (
                                <div key={m.id} className="text-sm mb-2 pb-2 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0">
                                    <span className="font-bold text-slate-700">{m.senderId === currentUserId ? 'You' : 'Seller'}:</span> <span className="text-slate-600">{m.content}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-6 text-center text-xs text-gray-400 max-w-2xl mx-auto">
                        By confirming, {listing.priceVP} VP will be deducted from your administrative credits and held in secure operational escrow.
                        <br />
                        <span className="text-green-600">
                            * Includes {listing.category?.escrowPercentage || 15}% Operational Escrow (Unused credits are automatically refunded after verification).
                        </span>
                    </div>
                </div>
            </div>

            {/* INQUIRY MODAL */}
            {isInquiryModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">🔐 Safe Inquiry Protocol</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            To prevent fee circumvention and protect privacy, direct contact sharing is prohibited before escrow. Select a certified question:
                        </p>

                        <div className="space-y-3">
                            <button onClick={() => handleSendMessage('AVAILABILITY')} className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 transition-colors">Is this item still available?</button>
                            <button onClick={() => handleSendMessage('CONDITION')} className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 transition-colors">Confirm condition matches description?</button>
                            <button onClick={() => handleSendMessage('DETAIL_REQUEST')} className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 transition-colors">Request more history/details?</button>
                            <button onClick={() => handleSendMessage('PICKUP_COORD')} className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 transition-colors">Can we coordinate pickup via platform?</button>
                        </div>

                        <button onClick={() => setIsInquiryModalOpen(false)} className="mt-6 w-full py-2.5 text-gray-500 hover:text-gray-700 font-medium">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
