"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/api";
import { adsClient } from "@/lib/ads-client";

interface PendingSub {
    id: string;
    tier: string;
    amount: number;
    currency: string;
    createdAt: string;
    user: {
        fullName: string;
        email: string;
    };
}

export default function AdminSubscriptions() {
    const [pending, setPending] = useState<PendingSub[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [transactionId, setTransactionId] = useState("");

    // DEMO ADMIN ID
    const DEMO_ADMIN_ID = "9d2c7649-9cf0-48fb-889a-1369e20615a6";

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/subscriptions/pending`);
            const data = await res.json();
            setPending(data);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const handleVerify = async (subId: string) => {
        setVerifyingId(subId);
    };

    const confirmVerify = async () => {
        if (!verifyingId) return;

        try {
            await adsClient.post(`/subscriptions/${verifyingId}/verify`, {
                adminId: DEMO_ADMIN_ID,
                transactionId
            });

            alert("Subscription Activated!");
            setVerifyingId(null);
            setTransactionId("");
            fetchPending();
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Subscription Audit Portal</h1>
                        <p className="text-gray-500 mt-1">Review and activate manual Whish/OMT payments.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {pending.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                        No pending subscription requests.
                                    </td>
                                </tr>
                            ) : (
                                pending.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-bold text-gray-900">{sub.user.fullName}</div>
                                            <div className="text-xs text-gray-500">{sub.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                                                ${sub.tier === 'BUSINESS' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}
                                            `}>
                                                {sub.tier}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                                            ${sub.amount} {sub.currency}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(sub.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleVerify(sub.id)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all"
                                            >
                                                Verify Payment
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Verification Modal */}
            {verifyingId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Activation</h2>
                        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                            Ensure the Whish/OMT reference number is correct and money is received before activating.
                        </p>

                        <div className="space-y-4 mb-8">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Transaction Reference</label>
                            <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="Ref # from Whish receipt"
                                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setVerifyingId(null)}
                                className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmVerify}
                                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-100"
                            >
                                Activate Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
