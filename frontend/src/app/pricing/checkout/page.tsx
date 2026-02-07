"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import { adsClient } from "@/lib/ads-client";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { useAuth } from "@/context/AuthContext";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tier = searchParams.get("tier");
    const amount = searchParams.get("amount");
    const duration = searchParams.get("duration") || 'MONTHLY';
    const [reference, setReference] = useState("");
    const [loading, setLoading] = useState(false);

    const { config } = useSystemConfig();
    const { user } = useAuth(); // Real User

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert("You must be logged in to subscribe.");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                userId: user.id,
                tier: tier || 'BUSINESS',
                amount: parseFloat(amount || "0"),
                currency: "USD",
                duration: duration,
                // In a real app, we'd upload the reference image or number here
                // For this MVP, we just create the pending request
            };

            await adsClient.post('/subscriptions/buy', payload);

            alert(`Subscription request submitted! Please send payment and notify admin on ${config?.whishPhoneNumber} with your reference ID.`);
            router.push('/dashboard');
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl">Please log in to upgrade your account.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-indigo-600 p-8 text-white">
                        <h1 className="text-2xl font-bold">Secure Your Upgrade</h1>
                        <p className="opacity-80 mt-1">Completing payment for {tier} Plan ({duration})</p>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Step 1: Whish Details */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">1</span>
                                Send Payment via Whish Money
                            </h2>
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="text-gray-500 uppercase tracking-wider font-bold text-[10px]">Recipient Number</div>
                                    <div className="text-gray-900 font-mono font-bold text-xl">{config?.whishPhoneNumber || 'Loading...'}</div>
                                    <div className="text-gray-500 uppercase tracking-wider font-bold text-[10px]">Amount Due</div>
                                    <div className="text-indigo-600 font-bold text-lg">${amount} USD</div>
                                    <div className="text-gray-500 uppercase tracking-wider font-bold text-[10px]">Note</div>
                                    <div className="text-gray-900 font-medium">Subscription Support</div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Evidence Submission */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">2</span>
                                Submit Proof of Payment
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Reference Number (Optional)</label>
                                <input
                                    type="text"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    placeholder="e.g. 123456789"
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            <p className="text-xs text-gray-400 italic leading-relaxed">
                                <strong>Note:</strong> Subscription activation is manual. After clicking below, our admin will verify the transfer to the Whish number provided and activate your account within 2-4 hours.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="flex-1 py-4 px-6 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`
                                        flex-1 py-4 px-6 bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 hover:bg-indigo-700
                                        ${loading ? 'opacity-50 cursor-wait' : ''}
                                    `}
                                >
                                    {loading ? 'Submitting...' : 'Confirm Payment Sent'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Checkout() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
