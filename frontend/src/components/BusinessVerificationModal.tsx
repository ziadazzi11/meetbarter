import React, { useState } from 'react';
import { API_BASE_URL } from "@/config/api";

interface BusinessVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export default function BusinessVerificationModal({ isOpen, onClose, userId }: BusinessVerificationModalProps) {
    const [businessName, setBusinessName] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [status, setStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('SUBMITTING');
        try {
            const res = await fetch(`${API_BASE_URL}/users/${userId}/request-business`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessName, referralCode })
            });
            if (!res.ok) throw new Error('Failed to submit request');
            setStatus('SUCCESS');
        } catch (err) {
            setStatus('ERROR');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-[500px]">
                <h2 className="modal-title">Business Identity Verification</h2>

                {status === 'SUCCESS' ? (
                    <div className="text-center p-5">
                        <div className="text-[40px] mb-2">✅</div>
                        <h3>Request Submitted</h3>
                        <p>Your application is under review.</p>
                        <p><strong>Next Step:</strong> Please contact the Admin to complete the identity check and processing fee payment via WhatsApp.</p>
                        <button onClick={onClose} className="btn-primary mt-5">Close</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="bg-blue-50 p-4 rounded-lg mb-5 border border-blue-200">
                            <h4 className="m-0 mb-2 text-blue-700">🛡️ Why Verify?</h4>
                            <p className="text-sm text-black m-0">
                                Verification is an <strong>identity check</strong> to ensure businesses are legitimate entities.
                                This protects our community from anonymous actors and fraud.
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="input-label">Business / Trading Name</label>
                            <input
                                required
                                className="form-input"
                                value={businessName}
                                onChange={e => setBusinessName(e.target.value)}
                                placeholder="e.g. Green Leaf Cafe"
                            />
                        </div>

                        <div className="form-group font-bold">
                            <label className="input-label">Invited by? (Referral Code)</label>
                            <input
                                className="form-input border-green-300"
                                onChange={e => setReferralCode(e.target.value)}
                                placeholder="Optional: Enter a User ID"
                            />
                        </div>

                        <div className="form-group mb-5">
                            <label className="input-label">Country of Registration</label>
                            <select className="form-input" defaultValue="Lebanon" title="Country of Registration">
                                <option value="Lebanon">Lebanon</option>
                                <option value="UAE">UAE</option>
                                <option value="KSA">KSA</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="text-[0.85rem] text-slate-600 mb-5">
                            <p><strong>Required Documents (Transparency Check):</strong></p>
                            <ul className="pl-5 mt-1">
                                <li><strong>Lebanon:</strong> Commercial Circular (Idha&apos;ah Tujariyah) & Tax ID (Maliyah).</li>
                                <li><strong>UAE/KSA:</strong> Valid Trade License.</li>
                                <li>One-time administrative processing fee applies.</li>
                                <li><strong>Note:</strong> This checks legal existence only. No VP benefits.</li>
                            </ul>
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                            <button type="submit" className="btn-primary flex-1" disabled={status === 'SUBMITTING'}>
                                {status === 'SUBMITTING' ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                        {status === 'ERROR' && <p className="text-red-500 mt-2 text-sm">Something went wrong. Please try again.</p>}
                    </form>
                )}
            </div>
        </div>
    );
}
