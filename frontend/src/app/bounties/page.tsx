"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";
// import { useRouter } from "next/navigation";

interface Bounty {
    id: string;
    title: string;
    description: string;
    rewardVP: number;
    status: 'OPEN' | 'CLAIMED' | 'SUBMITTED' | 'COMPLETED';
    assigneeId?: string;
    assignee?: { fullName: string };
    createdAt: string;
}

export default function BountiesPage() {
    // const router = useRouter();
    const [bounties, setBounties] = useState<Bounty[]>([]);
    const [loading, setLoading] = useState(true);

    // Evidence Submission State
    const [selectedBountyId, setSelectedBountyId] = useState<string | null>(null);
    const [evidence, setEvidence] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // DEMO USER
    const DEMO_USER_ID = "9d2c7649-9cf0-48fb-889a-1369e20615a6";

    useEffect(() => {
        fetchBounties();
    }, []);

    const fetchBounties = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/bounties`);
            if (res.ok) {
                const data = await res.json();
                setBounties(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (bountyId: string) => {
        if (!confirm("Are you sure you want to claim this bounty? You will be responsible for completing it.")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/bounties/${bountyId}/claim`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: DEMO_USER_ID })
            });

            if (!res.ok) throw new Error(await res.text());

            alert("Bounty Claimed! Good luck.");
            fetchBounties();
        } catch (e: any) {
            alert("Error claiming bounty: " + e.message);
        }
    };

    const handleSubmitEvidence = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBountyId) return;
        setSubmitting(true);

        try {
            const res = await fetch(`${API_BASE_URL}/bounties/${selectedBountyId}/submit`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ evidence })
            });

            if (!res.ok) throw new Error(await res.text());

            alert("Evidence submitted! An admin will review your work.");
            setEvidence("");
            setSelectedBountyId(null);
            fetchBounties();
        } catch (e: any) {
            alert("Error submitting evidence: " + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                        Community Bounties 🏆
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Earn Value Points by completing tasks for the community. Help us grow and thrive!
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {bounties.map((bounty) => (
                            <div
                                key={bounty.id}
                                className={`
                                    bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-all hover:shadow-md
                                    ${bounty.status === 'COMPLETED' ? 'opacity-75' : ''}
                                `}
                            >
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`
                                            px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                            ${bounty.status === 'OPEN' ? 'bg-green-100 text-green-800' : ''}
                                            ${bounty.status === 'CLAIMED' ? 'bg-blue-100 text-blue-800' : ''}
                                            ${bounty.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' : ''}
                                            ${bounty.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' : ''}
                                        `}>
                                            {bounty.status}
                                        </span>
                                        <div className="flex items-center text-indigo-600 font-bold">
                                            <span className="text-xl mr-1">{bounty.rewardVP}</span>
                                            <span className="text-xs uppercase">VP</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{bounty.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{bounty.description}</p>

                                    {bounty.assignee && (
                                        <div className="flex items-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                                            <span>👤 Claimed by {bounty.assignee.fullName}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-gray-50 border-t border-gray-100">
                                    {bounty.status === 'OPEN' && (
                                        <button
                                            onClick={() => handleClaim(bounty.id)}
                                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
                                        >
                                            Claim Task
                                        </button>
                                    )}

                                    {bounty.status === 'CLAIMED' && bounty.assigneeId === DEMO_USER_ID && (
                                        <button
                                            onClick={() => setSelectedBountyId(bounty.id)}
                                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                                        >
                                            Submit Evidence
                                        </button>
                                    )}

                                    {bounty.status === 'CLAIMED' && bounty.assigneeId !== DEMO_USER_ID && (
                                        <button disabled className="w-full py-2 bg-gray-200 text-gray-500 font-bold rounded-lg cursor-not-allowed">
                                            Unavailable
                                        </button>
                                    )}

                                    {(bounty.status === 'SUBMITTED' || bounty.status === 'COMPLETED') && (
                                        <div className="text-center text-sm font-medium text-gray-500 py-2">
                                            {bounty.status === 'SUBMITTED' ? 'Under Review' : 'Task Completed'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Evidence Modal */}
            {selectedBountyId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold mb-4">Submit Evidence</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Please provide a link to your work or a description of what you achieved.
                        </p>
                        <form onSubmit={handleSubmitEvidence}>
                            <textarea
                                value={evidence}
                                onChange={e => setEvidence(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 h-32 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Details, links, or proof..."
                                required
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setSelectedBountyId(null); setEvidence(""); }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                                >
                                    {submitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
