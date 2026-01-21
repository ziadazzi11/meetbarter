"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TradeTimeline from "@/components/TradeTimeline";
import PreTradeChecklist from "@/components/PreTradeChecklist";
import SoftCommitmentModal from "@/components/SoftCommitmentModal";
import CashWaiverModal from "@/components/CashWaiverModal";
import "./trade.css";

export default function TradeDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [trade, setTrade] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showCommitmentModal, setShowCommitmentModal] = useState(false);
    const [showCashModal, setShowCashModal] = useState(false);
    const [showChecklist, setShowChecklist] = useState(false);

    // DEMO USER ID (From seed)
    const DEMO_USER_ID = "9d2c7649-9cf0-48fb-889a-1369e20615a6";

    // Poll for updates (simplified for MVP)
    const fetchTrade = () => {
        fetch(`http://localhost:3001/trades/${id}`)
            .then(res => res.json())
            .then(data => {
                setTrade(data);
                setLoading(false);

                // Auto-show soft commitment if applicable
                const lastState = data.timeline?.[data.timeline.length - 1]?.state;
                if (lastState === 'OFFER_ACCEPTED' && !data.intentTimestamp) {
                    // Logic to show modal only once or based on user role can be refined
                    // setShowCommitmentModal(true); 
                }

                // Show checklist if intent is recorded but meetup not agreed
                if (data.intentTimestamp && lastState !== 'MEETUP_AGREED' && lastState !== 'TRADE_COMPLETED') {
                    // setShowChecklist(true);
                }
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (!id) return;
        fetchTrade();
        const interval = setInterval(fetchTrade, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [id]);

    const handleSoftCommitment = async () => {
        try {
            const res = await fetch(`http://localhost:3001/trades/${id}/intent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: DEMO_USER_ID })
            });

            if (!res.ok) throw new Error(await res.text());

            setShowCommitmentModal(false);
            fetchTrade();
            alert("Intent recorded!");
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    const handleChecklistSubmit = async (checklist: any) => {
        try {
            const res = await fetch(`http://localhost:3001/trades/${id}/checklist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: DEMO_USER_ID,
                    checklist
                })
            });

            if (!res.ok) throw new Error(await res.text());

            setShowChecklist(false);
            fetchTrade();
            alert("Checklist submitted! Meetup confirmed.");
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    const handleConfirmTrade = async () => {
        if (!confirm("Confirm you have received the item and want to unlock the funds?")) return;

        try {
            const res = await fetch(`http://localhost:3001/trades/${id}/confirm`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: DEMO_USER_ID })
            });

            if (!res.ok) throw new Error(await res.text());

            fetchTrade();
            alert("Trade Confirmed!");
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    const handleConfirmCashProposal = async (amount: number) => {
        // Here we would ideally send a message to the backend
        // For now MVP, we just alert and log the "contract" locally/visually
        // In full version: await axios.post('/messages', { tradeId, content: "SYSTEM: Cash proposed..." })
        setShowCashModal(false);
        if (amount > 0) {
            alert(`System Message Sent: 'User proposed $${amount} private cash settlement. Liability Waived.'`);
            console.log("Logged for Valuation AI:", { tradeId: id, cashAmount: amount });
        } else {
            alert("Proposed amount must be greater than 0.");
        }

        // Mocking the system message injection by just refreshing logic or assume realtime update
        // In a real app, this would push a message object.
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Trade Details...</div>;
    if (!trade) return <div className="p-8 text-center text-red-500">Trade not found.</div>;

    const lastState = trade.timeline?.[trade.timeline.length - 1]?.state || 'OFFER_SENT';
    const isBuyer = trade.buyerId === DEMO_USER_ID;
    const isSeller = trade.sellerId === DEMO_USER_ID;
    const otherParty = isBuyer ? trade.seller : trade.buyer;

    return (
        <div className="trade-detail-container">
            <button onClick={() => router.push('/dashboard')} className="back-link">← Back to Dashboard</button>

            <div className="trade-header">
                <h1>Trade for {trade.listing.title}</h1>
                <div className="trade-status-badge">{trade.status}</div>
            </div>

            <div className="trade-card">
                <h2>Trade Timeline</h2>
                <div className="timeline-wrapper">
                    <TradeTimeline timeline={trade.timeline || []} />
                </div>
            </div>

            <div className="trade-grid">
                <div className="trade-card main-info">
                    <h3>Trade Details</h3>
                    <div className="info-row">
                        <span className="label">Amount:</span>
                        <span className="value">{trade.offerVP} VP</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Operational Escrow:</span>
                        <span className="value">{trade.operationalEscrowVP} VP</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Counterparty:</span>
                        <span className="value">{otherParty.fullName}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Contact:</span>
                        <span className="value">{otherParty.phoneNumber || 'Hidden until confirmed'}</span>
                    </div>

                    {trade.intentTimestamp && (
                        <div className="trust-signal">
                            ✅ Intent Soft-Committed on {new Date(trade.intentTimestamp).toLocaleDateString()}
                        </div>
                    )}
                </div>

                <div className="trade-card actions">
                    <h3>Actions</h3>

                    {/* Soft Commitment Action */}
                    {!trade.intentTimestamp && (
                        <button
                            className="btn-action primary"
                            onClick={() => setShowCommitmentModal(true)}
                            disabled={trade.status === 'COMPLETED'}
                        >
                            Record Soft Commitment
                        </button>
                    )}

                    {/* Checklist Action */}
                    {trade.intentTimestamp && lastState !== 'MEETUP_AGREED' && lastState !== 'TRADE_COMPLETED' && (
                        <button
                            className="btn-action primary"
                            onClick={() => setShowChecklist(true)}
                        >
                            Complete Pre-Trade Checklist
                        </button>
                    )}

                    {/* Final Confirmation */}
                    {lastState === 'MEETUP_AGREED' && trade.status !== 'COMPLETED' && (
                        <button
                            className="btn-action success"
                            onClick={handleConfirmTrade}
                        >
                            Confirm Trade Completion
                        </button>
                    )}

                    {trade.status === 'COMPLETED' && (
                        <div className="completion-message">
                            🎉 Trade Successfully Completed
                        </div>
                    )}

                    {/* Cash Proposal (Anytime before complete) */}
                    {trade.status !== 'COMPLETED' && (
                        <div style={{ marginTop: 20, paddingTop: 10, borderTop: '1px dashed #e2e8f0' }}>
                            <button
                                className="w-full py-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded hover:bg-yellow-100 flex items-center justify-center gap-2"
                                onClick={() => setShowCashModal(true)}
                            >
                                💰 Propose Cash Top-up
                            </button>
                            <div className="text-xs text-center text-gray-400 mt-1">
                                (Private Contract • Off-Platform)
                            </div>
                        </div>
                    )}
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
                <div className="checklist-modal-overlay">
                    <PreTradeChecklist
                        onSubmit={handleChecklistSubmit}
                        onCancel={() => setShowChecklist(false)}
                    />
                </div>
            )}

            <style jsx>{`
                .checklist-modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
            `}</style>
        </div>
    );
}
