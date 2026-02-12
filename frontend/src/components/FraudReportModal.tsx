
import React, { useState } from 'react';

interface FraudReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string, evidence: string) => void;
}

export default function FraudReportModal({ isOpen, onClose, onConfirm }: FraudReportModalProps) {
    const [reason, setReason] = useState("");
    const [evidence, setEvidence] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-md">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border-2 border-red-50">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🚩</div>
                    <h2 className="text-2xl font-bold text-red-600 uppercase tracking-tighter">Report Fraudulent Activity</h2>
                    <p className="text-sm text-slate-600 mt-2">Flag this transaction for immediate administrative review.</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-red-600 uppercase mb-2 tracking-wider">
                            Reason for Report
                        </label>
                        <select
                            title="Reason for Report"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-gray-50 font-medium text-black"
                        >
                            <option value="">Select a reason...</option>
                            <option value="STOLEN_ITEM">Stolen Item / Property</option>
                            <option value="COUNTERFEIT">Counterfeit / Fake Item (Undeclared)</option>
                            <option value="MISREPRESENTATION">Major Misrepresentation of Condition</option>
                            <option value="SCAM">Financial Scam / Double Payment</option>
                            <option value="OTHER">Other Illegal Activity</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2 tracking-wider">
                            Evidence / Detailed Notes
                        </label>
                        <textarea
                            value={evidence}
                            onChange={(e) => setEvidence(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all text-black bg-white"
                            placeholder="Please provide specific details or links to evidence (e.g. photos, chat logs)..."
                            rows={5}
                        />
                    </div>
                </div>

                <div className="mt-8 p-4 bg-red-50 rounded-xl border border-red-100 mb-6">
                    <p className="text-[10px] text-red-800 leading-relaxed font-bold">
                        ⚠️ WARNING: Filing a false fraud report is a serious violation of MeetBarter's Terms of Service and may result in permanent account suspension.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-100 text-black rounded-xl hover:bg-gray-200 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(reason, evidence)}
                        disabled={!reason || !evidence}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold shadow-lg shadow-red-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        File Formal Report
                    </button>
                </div>
            </div>
        </div>
    );
}
