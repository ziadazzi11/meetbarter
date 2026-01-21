import React, { useState } from 'react';

interface CommunityVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export default function CommunityVerificationModal({ isOpen, onClose, userId }: CommunityVerificationModalProps) {
    const [role, setRole] = useState('GARDENER');
    const [idPhoto, setIdPhoto] = useState('');
    const [certPhoto, setCertPhoto] = useState('');
    const [treeSelfie, setTreeSelfie] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:3001/users/${userId}/request-community`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role,
                    evidence: {
                        idPhotoUrl: idPhoto,
                        certUrl: certPhoto,
                        optionalTreeSelfieUrl: treeSelfie
                    }
                })
            });

            if (response.ok) {
                alert("Verification submitted! An ambassador will review your details shortly. 🌱");
                onClose();
            } else {
                alert("Failed to submit verification.");
            }
        } catch (err) {
            console.error(err);
            alert("Error submitted verification.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">Community Service Verification 🎖️</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Verified community members get <strong>+5 Extra Listings</strong> (Gardeners get +20!).
                </p>

                <form onSubmit={handleSubmit} className="form-group">
                    <div>
                        <label className="input-label">Select Your Role</label>
                        <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="GARDENER">🧑‍🌾 Gardener</option>
                            <option value="DOCTOR">👨‍⚕️ Doctor</option>
                            <option value="TEACHER">👩‍🏫 Teacher</option>
                            <option value="STUDENT">🎓 Student</option>
                            <option value="VETERAN">🎖️ Veteran</option>
                            <option value="FIREFIGHTER">🚒 Firefighter</option>
                        </select>
                    </div>

                    <div>
                        <label className="input-label">ID / Proof of Identity (URL)</label>
                        <input
                            className="form-input"
                            placeholder="https://..."
                            required
                            value={idPhoto}
                            onChange={e => setIdPhoto(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="input-label">Certificate / Work Proof (URL)</label>
                        <input
                            className="form-input"
                            placeholder="https://..."
                            required
                            value={certPhoto}
                            onChange={e => setCertPhoto(e.target.value)}
                        />
                    </div>

                    {/* Special Gardener Section */}
                    {role === 'GARDENER' && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200 mt-2 mb-2">
                            <label className="input-label text-green-800">🌳 The "Gardener's Special" (Optional)</label>
                            <p className="text-xs text-green-600 mb-2">
                                We love our gardeners! Upload a selfie with your favorite tree or bush to join the "Green Thumb" club.
                                <br /><em>(Totally optional if you are shy!)</em>
                            </p>
                            <input
                                className="form-input"
                                placeholder="Selfie URL (Optional)"
                                value={treeSelfie}
                                onChange={e => setTreeSelfie(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="modal-actions mt-4">
                        <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1">
                            {loading ? 'Submitting...' : 'Submit for Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
