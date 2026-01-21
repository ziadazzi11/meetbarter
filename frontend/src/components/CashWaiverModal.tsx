
import React from 'react';

interface CashWaiverModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
}

export default function CashWaiverModal({ isOpen, onClose, onConfirm }: CashWaiverModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border-t-4 border-yellow-500">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-4">⚖️</div>
                    <h2 className="text-xl font-bold text-gray-900">Legal Disclaimer</h2>
                    <p className="text-sm text-yellow-700 font-semibold mt-1">Off-Platform Cash Settlement</p>
                </div>

                <div className="space-y-4 text-sm text-gray-700 bg-gray-50 p-4 rounded border border-gray-200">
                    <p>
                        You are about to propose a private cash transaction.
                        <strong> Dekish is NOT a party to this agreement.</strong>
                    </p>

                    {/* Amount Input */}
                    <div className="my-4">
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                            Proposed Cash Amount (USD)
                        </label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded p-2 text-lg font-mono focus:ring-2 focus:ring-yellow-500 outline-none"
                            placeholder="e.g. 50"
                            id="cashAmount"
                        />
                        <p className="text-xs text-gray-500 mt-1">This amount will be logged for valuation transparency.</p>
                    </div>

                    <ul className="list-disc pl-5 space-y-2">
                        <li>Meetbarter <strong>does not verify</strong>, insure, or facilitate cash payments.</li>
                        <li>You assume <strong>100% risk</strong> of theft, fraud, or counterfeit currency.</li>
                        <li>Platform Dispute Resolution <strong>cannot assist</strong> with cash-related conflicts.</li>
                    </ul>
                    <p className="font-bold text-red-600 mt-2">
                        By proceeding, you explicitly waive any claim against Meetbarter regarding this cash exchange.
                    </p>
                </div>

                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            const val = (document.getElementById('cashAmount') as HTMLInputElement).value;
                            onConfirm(val ? Number(val) : 0);
                        }}
                        className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 font-bold"
                    >
                        I Accept & Propose
                    </button>
                </div>
            </div>
        </div>
    );
}
