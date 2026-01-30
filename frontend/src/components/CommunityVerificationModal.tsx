import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import { API_BASE_URL } from "@/config/api";

interface CommunityVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export default function CommunityVerificationModal({ isOpen, onClose, userId }: CommunityVerificationModalProps) {
    const [role, setRole] = useState('GARDENER');
    const [customRole, setCustomRole] = useState('');
    const [idPhoto, setIdPhoto] = useState<string[]>([]);
    const [certPhoto, setCertPhoto] = useState<string[]>([]);
    const [treeSelfie, setTreeSelfie] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const finalRole = role === 'OTHER' ? customRole : role;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/request-community`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: finalRole,
                    evidence: {
                        idPhotoUrl: idPhoto[0] || '',
                        certUrl: certPhoto[0] || '',
                        optionalTreeSelfieUrl: treeSelfie[0] || ''
                    }
                })
            });

            if (response.ok) {
                alert("Verification submitted! An ambassador will review your details shortly.");
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
                <h2 className="modal-title">Community Service Verification</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Verified community members get <strong>+5 Extra Listings</strong>.
                </p>

                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                    <div className="flex items-start">
                        <span className="text-2xl mr-3">⚠️</span>
                        <div>
                            <h3 className="text-red-800 font-bold text-sm uppercase tracking-wide">Identity Warning</h3>
                            <p className="text-sm text-red-700 mt-1 leading-relaxed">
                                Please select your role accurately. This helps the system understand our community and analyze what services are lacking.
                                <br /><br />
                                <strong>Warning:</strong> Misrepresenting your identity will result in a <strong>24-hour ban</strong> and your account will be permanently restricted to <strong>5 listings</strong>.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="form-group space-y-4">
                    <div>
                        <label className="input-label">Select Your Role</label>
                        <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Select Community Role">
                            <option value="GARDENER">Gardener</option>
                            <option value="DOCTOR">Doctor</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="STUDENT">Student</option>
                            <option value="VETERAN">Veteran</option>
                            <option value="FIREFIGHTER">Firefighter</option>
                            <option value="ENGINEER">Engineer</option>
                            <option value="ARTIST">Artist</option>
                            <option value="MUSICIAN">Musician</option>
                            <option value="CHEF">Chef</option>
                            <option value="driver">Driver</option>
                            <option value="DEVELOPER">Developer</option>
                            <option value="WRITER">Writer</option>
                            <option value="BUSINESS_OWNER">Business Owner</option>
                            <option value="ENTREPRENEUR">Entrepreneur</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    {role === 'OTHER' && (
                        <div>
                            <label className="input-label">Specify Role</label>
                            <input
                                className="form-input"
                                placeholder="e.g. Carpenter, Nanny..."
                                value={customRole}
                                onChange={(e) => setCustomRole(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="input-label">ID / Proof of Identity</label>
                        <ImageUpload
                            initialImages={idPhoto}
                            onUpload={(urls) => setIdPhoto(urls)}
                            maxImages={1}
                        />
                    </div>

                    <div>
                        <label className="input-label">Certificate / Work Proof</label>
                        <ImageUpload
                            initialImages={certPhoto}
                            onUpload={(urls) => setCertPhoto(urls)}
                            maxImages={1}
                        />
                    </div>

                    {/* Special Gardener Section */}
                    {role === 'GARDENER' && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200 mt-2 mb-2">
                            <label className="input-label text-green-800">The &quot;Gardener&quot;s Special&quot; (Optional)</label>
                            <p className="text-xs text-green-600 mb-2">
                                We love our gardeners! Upload a selfie with your favorite tree or bush to join the &quot;Green Thumb&quot; club.
                                <br /><em>(Totally optional if you are shy!)</em>
                            </p>
                            <ImageUpload
                                initialImages={treeSelfie}
                                onUpload={(urls) => setTreeSelfie(urls)}
                                maxImages={1}
                            />
                        </div>
                    )}

                    <div className="modal-actions mt-6">
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
