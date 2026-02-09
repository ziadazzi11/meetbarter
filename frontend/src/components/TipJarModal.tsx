"use client";

import React, { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { API_BASE_URL } from '@/config/api';
import { useSystemConfig } from '@/hooks/useSystemConfig';

interface TipJarModalProps {
    isOpen: boolean;
    onClose: () => void;
    tradeId?: string;
    estimatedSavings: number;
    userCurrency: string;
}

export default function TipJarModal({ isOpen, onClose, tradeId, estimatedSavings, userCurrency }: TipJarModalProps) {
    const [amount, setAmount] = useState<number>(1);
    const [message, setMessage] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [step, setStep] = useState<'AMOUNT' | 'PAYMENT'>('AMOUNT');
    const { showToast } = useToast();
    const { config } = useSystemConfig();

    if (!isOpen) return null;

    const handleInitialSubmit = () => {
        setStep('PAYMENT');
    };

    const handleConfirmPayment = async () => {
        try {
            // In a real app, this would integrate with a payment gateway or upload proof
            // For now, we simulate the contribution creation
            await fetch(`${API_BASE_URL}/contributions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    tradeId,
                    amount,
                    currency: 'USD', // For simplicity, tips are often USD standardized or converted
                    message,
                    isPublic
                })
            });

            showToast('Thank you for your support! 💖', 'SUCCESS');
            onClose();
        } catch (error) {
            console.error('Failed to creating contribution:', error);
            showToast('Failed to process contribution', 'ERROR');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-purple-600" />

                {step === 'AMOUNT' ? (
                    <>
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-4">🎉</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Trade Complete!</h3>
                            <p className="text-gray-600">
                                You just saved approximately <span className="font-semibold text-green-600">{userCurrency} {estimatedSavings}</span> by bartering.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                                    Support MeetBarter with a small tip?
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 3, 5, 10].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setAmount(val)}
                                            className={`py-2 rounded-lg border transition-all ${amount === val
                                                ? 'bg-purple-50 border-purple-500 text-purple-700 font-semibold shadow-sm'
                                                : 'border-gray-200 hover:border-purple-300 text-gray-600'
                                                }`}
                                        >
                                            ${val}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-3 flex items-center justify-center gap-2">
                                    <span className="text-gray-500 text-sm">or custom: $</span>
                                    <input
                                        type="number"
                                        aria-label="Custom Tip Amount"
                                        value={amount}
                                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                                        className="w-20 border-b border-gray-300 focus:border-purple-500 outline-none text-center py-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Leave a message? (Optional)
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    rows={2}
                                    placeholder="Thanks for the platform!"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    className="rounded text-purple-600 focus:ring-purple-500"
                                />
                                <label htmlFor="isPublic" className="text-sm text-gray-600">
                                    Show my support on the public dashboard
                                </label>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                                >
                                    Maybe later
                                </button>
                                <button
                                    onClick={handleInitialSubmit}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                                >
                                    Support with ${amount} 💖
                                </button>
                            </div>

                            <p className="text-xs text-center text-gray-400">
                                Contributions are voluntary and non-refundable. <br />
                                100% goes to server costs & community grants.
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Send Payment</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Please send <strong>${amount}</strong> via Whish to:
                            </p>
                            <div className="bg-gray-100 p-4 rounded-xl mb-4 font-mono text-lg text-gray-800 select-all">
                                {config?.whishPhoneNumber || 'Loading...'}
                            </div>
                            <p className="text-xs text-gray-500 mb-6">
                                (Simulation: Clicking confirm will record the pledge)
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('AMOUNT')}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleConfirmPayment}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                            >
                                I Sent It ✅
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
