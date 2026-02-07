import React from 'react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    currentCount: number;
    limit: number;
}

export default function UpgradeModal({ isOpen, onClose, onUpgrade, currentCount, limit }: UpgradeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl max-w-sm w-11/12 shadow-2xl text-center">
                <div className="text-5xl mb-3">🚀</div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Storage Limit Reached</h2>
                <p className="text-slate-500 mb-5">
                    You have used <strong>{currentCount}</strong> of your <strong>{limit}</strong> available slots.
                </p>

                <div className="bg-sky-50 p-4 rounded-lg mb-5 border border-sky-200 text-left">
                    <h3 className="text-sky-700 font-bold text-lg mb-1">Premium Business Tier</h3>
                    <ul className="text-sky-800 text-sm list-disc pl-5 mt-2 space-y-1">
                        <li>Unlimited Listing Storage</li>
                        <li>Priority Search Placement</li>
                        <li>&quot;Premium&quot; Profile Badge</li>
                    </ul>
                </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg border border-slate-300 bg-transparent hover:bg-slate-50 transition-colors font-medium text-slate-600"
                    >
                        Maybe Later
                    </button>
                    <button
                        onClick={onUpgrade}
                        className="px-5 py-2.5 rounded-lg border-none bg-sky-600 hover:bg-sky-700 text-white font-bold transition-colors shadow-lg shadow-sky-200"
                    >
                        Upgrade Now
                    </button>
                </div>
            </div>
        </div>
    );
}
