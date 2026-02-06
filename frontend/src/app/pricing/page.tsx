"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/api";

interface Plan {
    tier: string;
    name: string;
    price: number;
    currency: string;
    listingLimit: number;
    features: string[];
    pricing?: {        // Added optional pricing structure
        monthly: number;
        yearly: number;
    };
}

export default function Pricing() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
    const router = useRouter();

    useEffect(() => {
        fetch(`${API_BASE_URL}/subscriptions/plans`)
            .then(res => res.json())
            .then(data => {
                setPlans(data);
                setLoading(false);
            })
            .catch(console.error);
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Empower Your Trade with MeetBarter
                    </h1>
                    <p className="mt-5 text-xl text-gray-500 mb-8">
                        Choose the plan that fits your trading volume. All barter transactions remain free.
                    </p>

                    {/* Billing Cycle Toggle */}
                    <div className="relative self-center bg-gray-100 rounded-lg p-1 flex inline-flex">
                        <button
                            onClick={() => setBillingCycle('MONTHLY')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${billingCycle === 'MONTHLY' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('YEARLY')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'YEARLY' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Yearly <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Save ~20%</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-x-12">
                    {plans.map((plan) => (
                        <div key={plan.tier} className={`
                            relative bg-white rounded-3xl shadow-xl border overflow-hidden p-8 flex flex-col
                            ${plan.tier === 'BUSINESS' ? 'ring-4 ring-indigo-600 border-indigo-600 scale-105 z-10' : 'border-gray-200'}
                        `}>
                            {plan.tier === 'BUSINESS' && (
                                <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-widest">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                                        {/* Dynamic Price Display */}
                                        {plan.price === 0 ? 'Free' : (
                                            `$${billingCycle === 'MONTHLY' ? (plan.pricing?.monthly || plan.price) : (plan.pricing?.yearly || plan.price)}`
                                        )}
                                    </span>
                                    {plan.price > 0 && (
                                        <span className="ml-1 text-xl font-semibold text-gray-500">
                                            /{billingCycle === 'MONTHLY' ? 'mo' : 'yr'}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    Up to {plan.listingLimit === 9999 ? 'Unlimited' : plan.listingLimit} active listings
                                </p>
                            </div>

                            <ul className="space-y-4 mb-10 flex-grow">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <span className="flex-shrink-0 h-6 w-6 text-green-500">
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                        <span className="ml-3 text-gray-600">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => {
                                    if (plan.price === 0) {
                                        router.push('/dashboard');
                                    } else {
                                        // Calculate amount to charge
                                        const amount = billingCycle === 'MONTHLY'
                                            ? (plan.pricing?.monthly || plan.price)
                                            : (plan.pricing?.yearly || plan.price);

                                        router.push(`/pricing/checkout?tier=${plan.tier}&amount=${amount}&duration=${billingCycle}`);
                                    }
                                }}
                                className={`
                                    w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 active:scale-95
                                    ${plan.tier === 'BUSINESS'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700'
                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}
                                `}
                            >
                                {plan.price === 0 ? 'Start Free' : 'Choose Plan'}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-20 bg-blue-50 rounded-3xl p-8 lg:p-12 border border-blue-100 shadow-sm text-center">
                    <h3 className="text-2xl font-bold text-blue-900">Why upgrade?</h3>
                    <p className="mt-4 text-lg text-blue-800 max-w-2xl mx-auto leading-relaxed">
                        Supporting MeetBarter ensures we can maintain the platform for everyone in Lebanon. Professional accounts help us provide secure brokerage services, reality checks, and premium coordination for the community.
                    </p>
                </div>
            </div>
        </div>
    );
}
