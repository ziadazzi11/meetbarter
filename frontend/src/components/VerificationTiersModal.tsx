import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import { API_BASE_URL } from "@/config/api";

interface VerificationTiersModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    currentLevel: number;
    onSuccess: () => void;
}

/**
 * v1.2 Unified Verification Tiers
 * Level 1: Community (Social Trust)
 * Level 2: Professional (Business/Identity)
 * Level 3: Institutional (NGO/Sovereignty)
 */
export default function VerificationTiersModal({ isOpen, onClose, userId, currentLevel, onSuccess }: VerificationTiersModalProps) {
    const [activeTab, setActiveTab] = useState(currentLevel + 1 > 3 ? 3 : currentLevel + 1);
    const [loading, setLoading] = useState(false);

    // Common Form States
    const [bizName, setBizName] = useState('');
    const [role, setRole] = useState('GARDENER');
    const [docs, setDocs] = useState<string[]>([]);
    const [links, setLinks] = useState<string[]>(['']);

    // Institutional Form States
    const [regNumber, setRegNumber] = useState('');
    const [permitType, setPermitType] = useState('Physical Goods');
    const [authority, setAuthority] = useState('');
    const [issuedAt, setIssuedAt] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let endpoint = '';
            let body = {};

            if (activeTab === 3) {
                endpoint = 'submit-license';
                body = {
                    businessName: bizName,
                    registrationNumber: regNumber,
                    permitType,
                    issuingAuthority: authority,
                    evidence: { links: links.filter(l => l.trim()), photos: docs },
                    issuedAt,
                    expiresAt
                };
            } else if (activeTab === 2) {
                endpoint = 'request-business';
                body = {
                    businessName: bizName,
                    evidence: { links: links.filter(l => l.trim()), photos: docs }
                };
            } else {
                endpoint = 'request-community';
                body = {
                    role,
                    evidence: { links: links.filter(l => l.trim()), photos: docs }
                };
            }

            const response = await fetch(`${API_BASE_URL}/users/${userId}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                alert(`Tier ${activeTab} verification request submitted!`);
                onSuccess();
                onClose();
            } else {
                const err = await response.json();
                alert(`Failed to submit request: ${err.message || 'Unknown error'}`);
            }
        } catch {
            alert("Connection error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-indigo-600 p-6 text-white sticky top-0 z-10">
                    <h2 className="text-2xl font-bold">Verification Tiers</h2>
                    <p className="text-indigo-100 text-sm">Upgrade your trust level to unlock features.</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 sticky top-[88px] z-10 bg-white">
                    {[1, 2, 3].map((t) => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === t ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Level {t} {currentLevel >= t && '✅'}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="p-6">
                    {activeTab === 1 && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 italic text-sm text-blue-800">
                                &quot;Community trust is the heartbeat of MeetBarter. Confirm your role to help others find you.&quot;
                            </div>
                            <div>
                                <label htmlFor="community-role" className="block text-sm font-medium text-gray-700 mb-1">Your Community Role</label>
                                <select id="community-role" className="w-full p-2.5 border border-gray-300 rounded-lg" value={role} onChange={e => setRole(e.target.value)}>
                                    <option value="GARDENER">Gardener</option>
                                    <option value="TEACHER">Teacher</option>
                                    <option value="DOCTOR">Doctor</option>
                                    <option value="OTHER">Other Professional</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Optional Evidence (ID/Certificate)</label>
                                <ImageUpload initialImages={docs} onUpload={setDocs} maxImages={1} />
                            </div>
                            <p className="text-xs text-gray-500">Tier 1 allows you to post up to 10 listings.</p>
                        </div>
                    )}

                    {activeTab === 2 && (
                        <div className="space-y-4">
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-sm text-purple-800">
                                <strong>Professional Verification:</strong> Required for businesses and high-value traders. Requires valid ID.
                            </div>
                            <div>
                                <label htmlFor="business-name" className="block text-sm font-medium text-gray-700 mb-1">Business / Professional Name</label>
                                <input
                                    id="business-name"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                                    placeholder="e.g. Acme Services"
                                    value={bizName}
                                    onChange={e => setBizName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof (Passport/National ID)</label>
                                <ImageUpload initialImages={docs} onUpload={setDocs} maxImages={1} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Verification Links (Optional)</label>
                                <div className="space-y-2">
                                    {links.map((link, idx) => (
                                        <input
                                            key={idx}
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                            placeholder="https://linkedin.com/..."
                                            value={link}
                                            onChange={e => {
                                                const newLinks = [...links];
                                                newLinks[idx] = e.target.value;
                                                setLinks(newLinks);
                                            }}
                                        />
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setLinks([...links, ''])}
                                        className="text-[10px] text-indigo-600 font-bold hover:underline"
                                    >
                                        + Add Another Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 3 && (
                        <div className="space-y-4">
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-800 font-bold">
                                🏛️ Institutional / NGO Tier
                            </div>
                            <p className="text-xs text-gray-600">
                                This tier is for registered NGOs, sovereign collectives, and legitimate businesses with official permits.
                                Unlocks &quot;Institutional Partner&quot; badge and high-fidelity features.
                            </p>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100 italic text-[10px] text-red-700">
                                <strong>⚠️ Absolute Prohibition:</strong> Institutional status **never** permits the exchange of firearms, ammunition, military gear, or weaponry. These items are strictly banned across all tiers.
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label htmlFor="inst-org-name" className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                                    <input
                                        id="inst-org-name"
                                        title="Organization Name"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                                        placeholder="e.g. Green Peace Lebanon"
                                        value={bizName}
                                        onChange={(e) => setBizName(e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label htmlFor="inst-reg-number" className="block text-sm font-medium text-gray-700 mb-1">Commercial Register / Tax ID</label>
                                    <input
                                        id="inst-reg-number"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                                        value={regNumber}
                                        onChange={e => setRegNumber(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="inst-permit-type" className="block text-sm font-medium text-gray-700 mb-1">Permit Type</label>
                                    <select
                                        id="inst-permit-type"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                                        value={permitType}
                                        onChange={e => setPermitType(e.target.value)}
                                    >
                                        <option>Physical Goods</option>
                                        <option>Logistics</option>
                                        <option>Food/Health</option>
                                        <option>NGO/Charity</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="inst-authority" className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority</label>
                                    <input
                                        id="inst-authority"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                                        placeholder="Min. of Industry"
                                        value={authority}
                                        onChange={e => setAuthority(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="inst-issue-date" className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                                    <input
                                        id="inst-issue-date"
                                        type="date"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                                        value={issuedAt}
                                        onChange={e => setIssuedAt(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="inst-expiry-date" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        id="inst-expiry-date"
                                        type="date"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                                        value={expiresAt}
                                        onChange={e => setExpiresAt(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Registration Documents (PDF/Photo)</label>
                                <ImageUpload initialImages={docs} onUpload={setDocs} maxImages={5} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Verification Links</label>
                                <div className="space-y-2">
                                    {links.map((link, idx) => (
                                        <input
                                            key={idx}
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                            placeholder="https://gov-registry.com/verify/..."
                                            value={link}
                                            onChange={e => {
                                                const newLinks = [...links];
                                                newLinks[idx] = e.target.value;
                                                setLinks(newLinks);
                                            }}
                                        />
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setLinks([...links, ''])}
                                        className="text-[10px] text-indigo-600 font-bold hover:underline"
                                    >
                                        + Add Another Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                            Close
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || currentLevel >= activeTab}
                            className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${currentLevel >= activeTab
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                                }`}
                        >
                            {loading ? 'Processing...' : currentLevel >= activeTab ? 'Already Verified' : `Unlock Tier ${activeTab}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
