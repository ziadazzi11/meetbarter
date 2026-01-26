"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AmbassadorPortal() {
    // Removed unused router
    // const router = useRouter(); 

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
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">🛡️ Ambassador Portal</h1>
                        <p className="text-gray-500 mt-1">Verify businesses, invite neighbors, earn trust.</p>
                    </div>

                    {/* Stats Box */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-8">
                        <div>
                            <div className="text-2xl font-bold text-green-600">{stats.earningsVP}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Earned VP</div>
                        </div>
                        <div className="border-l pl-8">
                            <div className="text-2xl font-bold text-blue-600">{stats.invited}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Invited</div>
                        </div>
                    </div>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Box 1: Referral Code */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">📢 Your Referral Code</h3>
                        </div>
                        <div className="p-6 flex-1 flex flex-col items-center justify-center">
                            <div
                                className="w-full bg-blue-50 border border-blue-200 p-4 rounded-lg text-center cursor-pointer hover:bg-blue-100 transition-all active:scale-95"
                                onClick={() => { navigator.clipboard.writeText("AMB-ZIAD-2026"); alert("Copied!"); }}
                                title="Click to copy"
                            >
                                <code className="text-xl font-mono font-bold text-blue-700 block">AMB-ZIAD-2026</code>
                                <span className="text-xs text-blue-500 mt-2 block">📋 Click to Copy</span>
                            </div>
                            <div className="mt-6 w-full space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    <span className="text-xl">💰</span>
                                    <span>Earn <strong>50 VP</strong> per user signup</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    <span className="text-xl">🛡️</span>
                                    <span>Earn <strong>100 VP</strong> per business verified</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Box 2: Pending Verifications */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden md:col-span-2 flex flex-col">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">🏢 Pending Verification Requests</h3>
                            <span className="text-xs font-medium px-2 py-1 bg-gray-200 text-gray-600 rounded-full">{pendingBusinesses.length} Pending</span>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto max-h-[400px]">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                                    Loading...
                                </div>
                            ) : pendingBusinesses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                                    <span className="text-4xl mb-2">✅</span>
                                    <p>All caught up! No pending businesses in your area.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingBusinesses.map((biz) => (
                                        <div key={biz.id} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors shadow-sm">
                                            <div className="mb-3 sm:mb-0">
                                                <h4 className="font-bold text-gray-900 text-lg">{biz.name}</h4>
                                                <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-4 mt-1">
                                                    <span className="flex items-center gap-1">👤 {biz.owner}</span>
                                                    <span className="flex items-center gap-1">📍 {biz.location}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 w-full sm:w-auto">
                                                <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors">
                                                    View Docs
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(biz.id)}
                                                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                                >
                                                    <span>✅ Verify</span>
                                                    <span className="bg-green-700/50 px-1.5 py-0.5 rounded text-[10px]">+100 VP</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Box 3: Quick Stats / Next Steps (Optional expansion for better layout balance) */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm text-white p-6 relative overflow-hidden md:col-span-3">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-bold mb-2">🚀 Level Up Your Impact</h3>
                                <p className="text-indigo-100 max-w-lg">
                                    You are currently a <strong className="text-white">Level 1 Ambassador</strong>. Verifying 3 more businesses will unlock the &quot;Community Pillar&quot; badge and increase your voting power.
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-lg shadow hover:bg-indigo-50 transition-colors">
                                    View Ambassador Guidelines
                                </button>
                            </div>
                        </div>
                        {/* Decorative circle */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                    </div>

                </div>
            </div>
        </div>
    );
}
