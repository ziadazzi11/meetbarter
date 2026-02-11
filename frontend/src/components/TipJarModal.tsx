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
    const [amount, setAmount] = useState<number>(3);
    const [message, setMessage] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [step, setStep] = useState<'AMOUNT' | 'PAYMENT'>('AMOUNT');
    const { showToast } = useToast();
    const { config } = useSystemConfig();

    if (!isOpen) return null;

    const handleInitialSubmit = () => {
        setStep('PAYMENT');
    };

    const handleConfirmPayment = async () => {
        try {
            await fetch(`${API_BASE_URL}/contributions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    tradeId,
                    amount,
                    currency: 'USD',
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
            <div className="glass-card rounded-[2.5rem] max-w-md w-full p-8 relative overflow-hidden animate-float-premium">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

                {step === 'AMOUNT' ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 pulse-neon">
                                <span className="text-4xl">💰</span>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Trade Secured!</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                You just saved approx. <span className="text-indigo-600 dark:text-indigo-400 font-black">{userCurrency} {estimatedSavings.toLocaleString()}</span>
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 text-center">
                                    Fuel the Network Growth?
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {[1, 3, 5, 10].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setAmount(val)}
                                            className={`py-3 rounded-2xl border transition-all duration-300 active:scale-95 flex flex-col items-center justify-center gap-1 ${amount === val
                                                ? 'bg-indigo-600 border-indigo-600 text-white font-black shadow-lg shadow-indigo-500/30'
                                                : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-500 dark:text-gray-400'
                                                }`}
                                        >
                                            <span className="text-xs opacity-60">$</span>
                                            <span className="text-lg">{val}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-6 glass-card px-4 py-3 rounded-2xl flex items-center justify-between border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Custom Pledge</span>
                                    <div className="flex items-center gap-1 font-black text-indigo-600">
                                        <span className="text-xs">$</span>
                                        <input
                                            type="number"
                                            aria-label="Custom Tip Amount"
                                            value={amount}
                                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                            className="w-16 bg-transparent outline-none text-right placeholder-gray-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">
                                        Legacy Note (Optional)
                                    </label>
                                    <textarea
                                        className="w-full px-5 py-4 bg-white/5 dark:bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-sm line-clamp-2"
                                        rows={2}
                                        placeholder="Add a message to the community ledger..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </div>

                                <label className="flex items-center gap-3 px-1 cursor-pointer group">
                                    <div className={`relative w-10 h-6 rounded-full transition-colors border border-white/10 ${isPublic ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-800'}`}>
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isPublic ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                    />
                                    <span className="text-xs font-medium text-gray-500 group-hover:text-gray-300 transition-colors">Make my support public</span>
                                </label>
                            </div>

                            <div className="flex flex-col gap-3 pt-4">
                                <button
                                    onClick={handleInitialSubmit}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
                                >
                                    Pledge Support
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-[10px] font-black uppercase tracking-[0.3em] transition-colors"
                                >
                                    Skip for now
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-10">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Transfer Details</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                                Please send exactly <span className="text-emerald-500 font-bold">${amount}</span> via Whish to the following registered identifier:
                            </p>

                            <div className="glass-card p-6 rounded-[2rem] mb-6 relative group active:scale-95 transition-transform cursor-pointer border-indigo-500/20"
                                title="Click to copy"
                                onClick={() => {
                                    navigator.clipboard.writeText(config?.whishPhoneNumber || '');
                                    showToast('Copied to clipboard!', 'SUCCESS');
                                }}>
                                <div className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">Whish Mobile Number</div>
                                <div className="text-2xl font-black text-gray-900 dark:text-white font-mono tracking-widest leading-none">
                                    {config?.whishPhoneNumber || '70 123 456'}
                                </div>
                                <div className="absolute top-4 right-6 opacity-40">📋</div>
                            </div>

                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                                Reference Code: CONTRIBUTOR_{Math.floor(Math.random() * 9000) + 1000}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleConfirmPayment}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98]"
                            >
                                I Sent the Transfer
                            </button>
                            <button
                                onClick={() => setStep('AMOUNT')}
                                className="w-full py-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-[10px] font-black uppercase tracking-[0.3em] transition-colors"
                            >
                                Edit Amount
                            </button>
                        </div>
                    </>
                )}

                <p className="mt-8 text-[9px] text-center text-gray-400 uppercase tracking-widest font-bold opacity-30">
                    Trust-Based Platform Contribution • 100% Peer-to-Peer
                </p>
            </div>
        </div>
    );
}
