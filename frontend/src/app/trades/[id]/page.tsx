"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import TradeTimeline from "@/components/TradeTimeline";
import PreTradeChecklist from "@/components/PreTradeChecklist";
import SoftCommitmentModal from "@/components/SoftCommitmentModal";
import CashWaiverModal from "@/components/CashWaiverModal";
import MessageThread from "@/components/MessageThread";
import { useNotifications } from "@/hooks/useNotifications";
import { API_BASE_URL } from "@/config/api";
import { adsClient } from "@/lib/ads-client";

interface Trade {
    id: string;
    listingId: string;
    buyerId: string;
    sellerId: string;
    offerVP: number;
    coordinationEscrowVP: number;
    status: string;
    intentTimestamp?: string;
    cashOffer?: number;
    cashCurrency?: string;
    listing: {
        title: string;
    };
    buyer: {
        id: string;
        fullName: string;
        phoneNumber?: string;
    };
    seller: {
        id: string;
        fullName: string;
        phoneNumber?: string;
    };
    timeline: {
        state: string;
        timestamp: string;
    }[];
}

export default function TradeDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [trade, setTrade] = useState<Trade | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCommitmentModal, setShowCommitmentModal] = useState(false);
    const [showCashModal, setShowCashModal] = useState(false);
    const [showChecklist, setShowChecklist] = useState(false);

    // DEMO USER ID (From seed)
    const DEMO_USER_ID = "9d2c7649-9cf0-48fb-889a-1369e20615a6";

    // 🔔 Real-Time Notifications
    useNotifications(DEMO_USER_ID);

    // Poll for updates (simplified for MVP)
    const fetchTrade = useCallback(() => {
        if (!id) return;
        fetch(`${API_BASE_URL}/trades/${id}`)
            .then(res => res.json())
            .then((data: Trade) => {
                setTrade(data);
                setLoading(false);
            })
            .catch((err: unknown) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        fetchTrade();
        const interval = setInterval(fetchTrade, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [fetchTrade]);

    const handleSoftCommitment = async () => {
        try {
            await adsClient.post(`/trades/${id}/intent`, { userId: DEMO_USER_ID });

            // const res = await fetch(`${API_BASE_URL}/trades/${id}/intent`, {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({ userId: DEMO_USER_ID })
            // });

            // if (!res.ok) throw new Error(await res.text());

            setShowCommitmentModal(false);
            fetchTrade();
            alert("Intent recorded!");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            alert("Error: " + message);
        }
    };

    const handleChecklistSubmit = async (checklist: Record<string, any>) => {
        try {
            await adsClient.post(`/trades/${id}/checklist`, {
                userId: DEMO_USER_ID,
                checklist
            });

            // const res = await fetch(`${API_BASE_URL}/trades/${id}/checklist`, {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({
            //         userId: DEMO_USER_ID,
            //         checklist
            //     })
            // });

            // if (!res.ok) throw new Error(await res.text());

            setShowChecklist(false);
            fetchTrade();
            alert("Checklist submitted! Meetup confirmed.");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            alert("Error: " + message);
        }
    };

    const handleConfirmTrade = async () => {
        if (!confirm("Confirm you have received the item and want to unlock the funds?")) return;

        try {
            await adsClient.post(`/trades/${id}/confirm`, { userId: DEMO_USER_ID });

            // const res = await fetch(`${API_BASE_URL}/trades/${id}/confirm`, {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({ userId: DEMO_USER_ID })
            // });

            // if (!res.ok) throw new Error(await res.text());

            fetchTrade();
            alert("Trade Confirmed!");
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    const handleConfirmCashProposal = async (amount: number, currency: string) => {
        setShowCashModal(false);
        if (amount <= 0) {
            alert("Proposed amount must be greater than 0.");
            return;
        }

        try {
            await adsClient.post(`/trades/${id}/cash`, { userId: DEMO_USER_ID, amount, currency });

            // const res = await fetch(`${API_BASE_URL}/trades/${id}/cash`, {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({ userId: DEMO_USER_ID, amount, currency })
            // });

            // if (!res.ok) throw new Error(await res.text());

            fetchTrade();
            alert(`Sweetener Added: ${amount} ${currency} recorded in timeline.`);
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!trade) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Trade Not Found</h2>
                <button onClick={() => router.push('/dashboard')} className="mt-4 text-blue-600 hover:underline">Return to Dashboard</button>
            </div>
        </div>
    );

    const lastState = trade.timeline?.[trade.timeline.length - 1]?.state || 'OFFER_SENT';
    const isBuyer = trade.buyerId === DEMO_USER_ID;
    // const isSeller = trade.sellerId === DEMO_USER_ID;
    const otherParty = isBuyer ? trade.seller : trade.buyer;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => router.push('/dashboard')} className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                    <span className="mr-2">←</span> Back to Dashboard
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trade for {trade.listing.title}</h1>
                        <p className="text-gray-500">Transaction ID: #{trade.id.slice(0, 8)}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide
                        ${trade.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                     `}>
                        {trade.status.replace('_', ' ')}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: DETAILS & ACTIONS */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Main Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-900">Transaction Details</h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Value Amount</div>
                                    <div className="text-2xl font-bold text-gray-900">{trade.offerVP} VP</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Operational Escrow (Coordination & Verification)</div>
                                    <div className="text-2xl font-bold text-blue-600">{trade.coordinationEscrowVP} VP</div>
                                </div>
                                <div className="pt-4 border-t border-gray-100 md:col-span-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-gray-500">Counterparty</div>
                                            <div className="font-semibold text-gray-900">{otherParty.fullName}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">Contact</div>
                                            <div className={`font-mono ${trade.intentTimestamp ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                                {trade.intentTimestamp ? (otherParty.phoneNumber || 'N/A') : 'Hidden until commitment'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {trade.intentTimestamp && (
                                <div className="bg-green-50 p-4 border-t border-green-100 flex items-center gap-2 text-green-700 text-sm font-medium">
                                    <span>✅</span> Intent Soft-Committed on {new Date(trade.intentTimestamp).toLocaleDateString()}
                                </div>
                            )}
                            {trade.cashOffer && (
                                <div className="bg-yellow-50 p-4 border-t border-yellow-100 flex items-center gap-2 text-yellow-800 text-sm font-medium">
                                    <span>💰</span> Cash Sweetener: {trade.cashOffer} {trade.cashCurrency} (Off-Platform)
                                </div>
                            )}
                        </div>

                        {/* Message Thread Integration */}
                        <MessageThread
                            tradeId={trade.id}
                            currentUserId={DEMO_USER_ID} // Using the demo user ID for now
                            otherUserId={otherParty.id}
                            listingId={trade.listingId}
                            otherUserName={otherParty.fullName}
                        />

                        {/* Actions Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-900">Required Actions</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {/* Soft Commitment Action */}
                                {!trade.intentTimestamp && (
                                    <button
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                                        onClick={() => setShowCommitmentModal(true)}
                                        disabled={trade.status === 'COMPLETED'}
                                    >
                                        <span>🤝</span> Record Soft Commitment
                                    </button>
                                )}

                                {/* Checklist Action */}
                                {trade.intentTimestamp && lastState !== 'MEETUP_AGREED' && lastState !== 'TRADE_COMPLETED' && (
                                    <button
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                                        onClick={() => setShowChecklist(true)}
                                    >
                                        <span>📋</span> Complete Pre-Trade Checklist
                                    </button>
                                )}

                                {/* Final Confirmation */}
                                {lastState === 'MEETUP_AGREED' && trade.status !== 'COMPLETED' && (
                                    <button
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                                        onClick={handleConfirmTrade}
                                    >
                                        <span>✅</span> Confirm Trade Completion
                                    </button>
                                )}

                                {trade.status === 'COMPLETED' && (
                                    <div className="text-center py-4 bg-green-50 rounded-lg border border-green-100 text-green-800 font-bold">
                                        🎉 Trade Successfully Completed
                                    </div>
                                )}

                                {/* Cash Proposal */}
                                {/* Cash Proposal - LAST RESORT */}
                                {trade.status !== 'COMPLETED' && (
                                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                                        <p className="text-xs text-gray-400 mb-2">Struggling to finalize this barter?</p>
                                        <button
                                            className="text-xs text-gray-500 hover:text-gray-900 underline decoration-dotted underline-offset-4"
                                            onClick={() => setShowCashModal(true)}
                                        >
                                            Add Off-Platform Cash Sweetener (Last Resort)
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: TIMELINE */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Trade Timeline</h2>
                            <div className="relative pl-2">
                                {/* Pass clean props to timeline component if possible, or wrap it to style it. 
                                    Assuming TradeTimeline accepts className or we wrap it. */}
                                <TradeTimeline timeline={trade.timeline || []} />
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-2">Safety Tips</h3>
                            <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                                <li>Meet in public places.</li>
                                <li>Verify item condition before confirming.</li>
                                <li>Do not bring large amounts of cash unless agreed.</li>
                            </ul>
                        </div>

                        {/* Legal One-Line Shield Footnote */}
                        <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                            <p className="text-[10px] text-gray-500 leading-tight">
                                <span className="font-bold">🛡️ Institutional Notice:</span> The platform charges for operational coordination services,
                                not for value exchange or access to Value Points. Value Points have no monetary value and are not purchased or sold.
                                Unused coordination escrow is automatically returned.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <SoftCommitmentModal
                isOpen={showCommitmentModal}
                onCancel={() => setShowCommitmentModal(false)}
                onConfirm={handleSoftCommitment}
                tradeSummary={{
                    itemTitle: trade.listing.title,
                    otherParty: otherParty.fullName,
                    priceVP: trade.offerVP
                }}
            />

            <CashWaiverModal
                isOpen={showCashModal}
                onClose={() => setShowCashModal(false)}
                onConfirm={handleConfirmCashProposal}
            />

            {showChecklist && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <PreTradeChecklist
                        onSubmit={handleChecklistSubmit}
                        onCancel={() => setShowChecklist(false)}
                    />
                </div>
            )}
        </div>
    );
}
