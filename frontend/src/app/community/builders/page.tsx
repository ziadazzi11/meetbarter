"use client";

import { useState, useEffect } from 'react';
import { API_BASE_URL } from "@/config/api";

interface Bounty {
    id: string;
    title: string;
    description: string;
    rewardVP: number;
    status: 'OPEN' | 'CLAIMED' | 'SUBMITTED' | 'COMPLETED';
    assignee?: { fullName: string; id: string };
    createdAt: string;
}

export default function BuildersPage() {
    const [bounties, setBounties] = useState<Bounty[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [submissionProof, setSubmissionProof] = useState("");
    const [selectedBountyId, setSelectedBountyId] = useState<string | null>(null);

    const fetchBounties = () => {
        setLoading(true);
        fetch(`${API_BASE_URL}/bounties`)
            .then(res => res.json())
            .then(data => {
                // Ensure data is an array before setting
                if (Array.isArray(data)) {
                    setBounties(data);
                } else {
                    setBounties([]);
                }
            })
            .catch(err => console.error("Failed to fetch bounties", err))
            .finally(() => setLoading(false));
    };

    // Auth & Data Fetching
    useEffect(() => {
        const uid = localStorage.getItem("meetbarter_uid");
        if (uid) setUserId(uid);

        fetchBounties();
    }, []);

    const handleClaim = async (id: string) => {
        if (!userId) return alert("Please log in first.");
        if (!confirm("Commit to this task?")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/bounties/${id}/claim`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (res.ok) {
                fetchBounties();
            } else {
                alert("Failed to claim task. It might already be taken.");
            }
        } catch (err) { alert("Failed to claim"); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBountyId) return;

        try {
            const res = await fetch(`${API_BASE_URL}/bounties/${selectedBountyId}/submit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ evidence: submissionProof })
            });
            if (res.ok) {
                alert("Work Submitted! An admin will review it shortly.");
                setSelectedBountyId(null);
                setSubmissionProof("");
                fetchBounties();
            } else {
                alert("Submission failed. Please try again.");
            }
        } catch (err) { alert("Failed to submit"); }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                        🛠️ Builders&apos; Hub
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Earn Value Points by contributing code, design, or audit work to the community.
                    </p>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading tasks...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bounties.map(bounty => (
                            <div
                                key={bounty.id}
                                className={`
                                    relative overflow-hidden rounded-xl border border-gray-200 p-6 sm:p-8 transition-all duration-300 hover:shadow-lg
                                    ${bounty.status === 'COMPLETED' ? 'bg-gray-50 opacity-75' : 'bg-white'}
                                `}
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{bounty.title}</h3>
                                            <span className={`
                                                px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                                ${bounty.status === 'OPEN' ? 'bg-green-100 text-green-800' : ''}
                                                ${bounty.status === 'CLAIMED' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                ${bounty.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' : ''}
                                                ${bounty.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' : ''}
                                            `}>
                                                {bounty.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed max-w-3xl">
                                            {bounty.description}
                                        </p>

                                        <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
                                            {bounty.assignee ? (
                                                <span>Assigned to: <span className="font-medium text-gray-700">{bounty.assignee.fullName}</span></span>
                                            ) : (
                                                <span>Unassigned</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-4 min-w-[120px]">
                                        <div className="text-2xl font-black text-blue-600">
                                            {bounty.rewardVP} VP
                                        </div>

                                        {bounty.status === 'OPEN' && (
                                            <button
                                                onClick={() => handleClaim(bounty.id)}
                                                className="w-full bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                                            >
                                                Claim Task
                                            </button>
                                        )}

                                        {bounty.status === 'CLAIMED' && userId && bounty.assignee?.id === userId && (
                                            <button
                                                onClick={() => setSelectedBountyId(bounty.id)}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-md"
                                            >
                                                Submit Work
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {bounties.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500 text-lg">No active bounties at the moment.</p>
                                <p className="text-gray-400 text-sm mt-1">Check back later for new opportunities!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Submission Modal */}
                {selectedBountyId && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 transform transition-all">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Submit Your Work</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Proof of Work
                                    </label>
                                    <textarea
                                        required
                                        value={submissionProof}
                                        onChange={e => setSubmissionProof(e.target.value)}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] text-gray-700"
                                        placeholder="Paste link to Pull Request, Google Doc, or design file..."
                                    />
                                    <p className="text-xs text-gray-400 mt-2">
                                        Admins will review your submission and award points upon verification.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedBountyId(null)}
                                        className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                                    >
                                        Submit for Review
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
