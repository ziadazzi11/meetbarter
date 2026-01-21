import React, { useState } from 'react';

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
            const res = await fetch(`http://localhost:3001/users/${userId}/request-business`, {
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
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <h2 className="modal-title">Business Identity Verification</h2>

                {status === 'SUCCESS' ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
                        <h3>Request Submitted</h3>
                        <p>Your application is under review.</p>
                        <p><strong>Next Step:</strong> Please contact the Admin to complete the identity check and processing fee payment via WhatsApp.</p>
                        <button onClick={onClose} className="btn-primary" style={{ marginTop: '20px' }}>Close</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bae6fd' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#0369a1' }}>🛡️ Why Verify?</h4>
                            <p style={{ fontSize: '0.9rem', color: '#334155', margin: 0 }}>
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

                        <div className="form-group">
                            <label className="input-label">Invited by? (Referral Code)</label>
                            <input
                                className="form-input"
                                style={{ borderColor: '#86efac' }}
                                onChange={e => setReferralCode(e.target.value)}
                                placeholder="Optional: Enter a User ID"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label className="input-label">Country of Registration</label>
                            <select className="form-input" defaultValue="Lebanon">
                                <option value="Lebanon">Lebanon</option>
                                <option value="UAE">UAE</option>
                                <option value="KSA">KSA</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
                            <p><strong>Required Documents (Transparency Check):</strong></p>
                            <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                                <li><strong>Lebanon:</strong> Commercial Circular (Idha'ah Tujariyah) & Tax ID (Maliyah).</li>
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
                        {status === 'ERROR' && <p style={{ color: 'red', marginTop: '10px', fontSize: '0.9rem' }}>Something went wrong. Please try again.</p>}
                    </form>
                )}
            </div>
        </div>
    );
}
