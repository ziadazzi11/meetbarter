"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AmbassadorPortal() {
    const router = useRouter();

    interface PendingBusiness {
        id: string;
        name: string;
        owner: string;
        location: string;
        status: string;
    }

    const [stats, setStats] = useState({ approved: 0, invited: 0, earningsVP: 0 });
    const [pendingBusinesses, setPendingBusinesses] = useState<PendingBusiness[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string>("");

    // Real Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Current Ambassador Stats (Me)
                const meRes = await fetch('http://localhost:3001/users/me');
                const meData = await meRes.json();
                setCurrentUserId(meData.id);

                // 2. Fetch Pending Businesses
                const pendingRes = await fetch('http://localhost:3001/users/pending-businesses');
                const pendingData = await pendingRes.json();

                setStats({
                    approved: meData.ambassadorScore || 0, // Using score as proxy for approved count
                    invited: 0, // TODO: Add real invite count if available
                    earningsVP: (meData.ambassadorScore || 0) * 50 // Assuming 50 VP per action
                });

                // Map backend users to frontend display format
                setPendingBusinesses(pendingData.map((u: any) => ({
                    id: u.id,
                    name: u.businessName,
                    owner: u.fullName,
                    location: 'Lebanon', // Placeholder as we don't store location yet
                    status: u.businessVerificationStatus
                })));

                setLoading(false);
            } catch (error) {
                console.error("Failed to load ambassador data", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleApprove = async (businessId: string) => {
        if (!confirm("Verify this business? You will accept liability for their initial trust score.")) return;

        try {
            await fetch(`http://localhost:3001/users/${businessId}/approve-business`, {
                method: 'PUT', // Changed to PUT to match controller
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verifierId: currentUserId, notes: "Verified via Ambassador Portal" })
            });

            alert(`Business Verified! +50 VP reward credited to your wallet.`);
            setPendingBusinesses(prev => prev.filter(b => b.id !== businessId));
            setStats(prev => ({ ...prev, approved: prev.approved + 1, earningsVP: prev.earningsVP + 50 }));
        } catch (err) {
            alert("Error verifying business");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">🛡️ Ambassador Portal</h1>
                        <p className="text-gray-500">Verify businesses, invite neighbors, earn trust.</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-6 text-center">
                        <div>
                            <div className="text-2xl font-bold text-green-600">{stats.earningsVP}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Earned VP</div>
                        </div>
                        <div className="border-l pl-6">
                            <div className="text-2xl font-bold text-blue-600">{stats.invited}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Invited</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Invite Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-1">
                        <h3 className="text-lg font-bold mb-4">📢 Your Referral Code</h3>
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded text-center cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => { navigator.clipboard.writeText("AMB-ZIAD-2026"); alert("Copied!"); }}>
                            <code className="text-xl font-mono font-bold text-blue-700">AMB-ZIAD-2026</code>
                            <p className="text-xs text-blue-500 mt-2">Click to copy</p>
                        </div>
                        <ul className="mt-6 space-y-3 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-green-500">💰</span>
                                <span>Earn <strong>50 VP</strong> for every verified user signup.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500">🛡️</span>
                                <span>Earn <strong>100 VP</strong> for verifying local businesses.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Verification Queue */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-2">
                        <h3 className="text-lg font-bold mb-4">🏢 Pending Verifications</h3>
                        {loading ? (
                            <div className="text-center py-10 text-gray-400">Loading requests...</div>
                        ) : pendingBusinesses.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">No pending businesses in your area.</div>
                        ) : (
                            <div className="space-y-4">
                                {pendingBusinesses.map((biz) => (
                                    <div key={biz.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{biz.name}</h4>
                                            <div className="text-sm text-gray-500 flex gap-2">
                                                <span>👤 {biz.owner}</span>
                                                <span>📍 {biz.location}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">View Docs</button>
                                            <button
                                                onClick={() => handleApprove(biz.id)}
                                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                                            >
                                                Verify & Earn 100 VP
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
