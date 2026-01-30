"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";

export default function AdminBusinessVerification() {
    const [pendingLicenses, setPendingLicenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [adminCodes, setAdminCodes] = useState({ code1: "", fingerprintCode: "" });

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/pending-licenses`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            setPendingLicenses(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch licenses", err);
            setLoading(false);
        }
    };

    const handleVerify = async (licenseId: string, status: 'VERIFIED' | 'REJECTED' | 'REVOKED') => {
        if (!adminCodes.code1 || !adminCodes.fingerprintCode) {
            alert("Please enter administrative codes for authorization.");
            return;
        }

        setVerifyingId(licenseId);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/licenses/${licenseId}/verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status,
                    reason: adminNotes || `Institutional ${status}`,
                    ...adminCodes
                })
            });

            if (res.ok) {
                alert(`License ${status} successfully.`);
                setPendingLicenses(prev => prev.filter(l => l.id !== licenseId));
                setAdminNotes("");
            } else {
                const error = await res.json();
                alert(`Error: ${error.message}`);
            }
        } catch (err) {
            alert("An error occurred during verification.");
        } finally {
            setVerifyingId(null);
        }
    };

    if (loading) return <div className="p-20 text-center">Loading Institutional Audit Queue...</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex justify-between items-end border-b pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">🏛️ Institutional License Audit</h1>
                        <p className="text-gray-500 mt-2">Verify high-fidelity business permits and issue Institutional Partner badges.</p>
                    </div>

                    <div className="flex gap-4">
                        <input
                            type="password"
                            placeholder="Alpha Code"
                            className="p-2 border rounded border-gray-300 text-sm w-32 outline-none focus:ring-1 focus:ring-blue-500"
                            value={adminCodes.code1}
                            onChange={(e) => setAdminCodes({ ...adminCodes, code1: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Fingerprint"
                            className="p-2 border rounded border-gray-300 text-sm w-32 outline-none focus:ring-1 focus:ring-blue-500"
                            value={adminCodes.fingerprintCode}
                            onChange={(e) => setAdminCodes({ ...adminCodes, fingerprintCode: e.target.value })}
                        />
                    </div>
                </div>

                {pendingLicenses.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <span className="text-4xl">✅</span>
                        <p className="mt-4 text-gray-400 font-medium">Institutional Registry is currently up to date.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {pendingLicenses.map((license) => {
                            const evidence = JSON.parse(license.evidence || '{"links":[], "photos":[]}');
                            return (
                                <div key={license.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                                    <div className="p-6 md:w-2/3 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{license.user.businessName || license.user.fullName}</h3>
                                                <p className="text-sm text-gray-500">{license.user.email}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                                {license.permitType}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <p className="text-gray-400 text-[10px] uppercase font-bold">Registration #</p>
                                                <p className="font-mono font-bold text-gray-700">{license.registrationNumber}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <p className="text-gray-400 text-[10px] uppercase font-bold">Issuing Authority</p>
                                                <p className="font-bold text-gray-700">{license.issuingAuthority}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <p className="text-gray-400 text-[10px] uppercase font-bold">Issue Date</p>
                                                <p className="font-bold text-gray-700">{new Date(license.issuedAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <p className="text-gray-400 text-[10px] uppercase font-bold">Expiry Date</p>
                                                <p className="font-bold text-red-600">{new Date(license.expiresAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-gray-700 mb-2">Audit Notes (Reasoning)</p>
                                            <textarea
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Specify findings during document check..."
                                                value={adminNotes}
                                                onChange={(e) => setAdminNotes(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gray-50 md:w-1/3 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200">
                                        <div className="space-y-4">
                                            {evidence.links.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-xs font-bold text-gray-500 uppercase">Verification Links:</p>
                                                    {evidence.links.map((link: string, i: number) => (
                                                        <a
                                                            key={i}
                                                            href={link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 truncate shadow-sm"
                                                        >
                                                            🔗 Link {i + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            {evidence.photos.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-xs font-bold text-gray-500 uppercase">Evidence Photos:</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {evidence.photos.map((photo: string, i: number) => (
                                                            <a key={i} href={photo} target="_blank" rel="noopener noreferrer" className="block aspect-square overflow-hidden rounded-lg border border-gray-200 shadow-sm relative group">
                                                                <img src={photo} alt="Evidence" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">👁️ View</div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <p className="text-[10px] text-gray-400 italic text-center mt-4">Verify watermarks and signatures before approving Institutional status.</p>
                                        </div>

                                        <div className="flex flex-col gap-3 mt-8">
                                            <button
                                                onClick={() => handleVerify(license.id, 'VERIFIED')}
                                                disabled={verifyingId !== null}
                                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:bg-gray-300"
                                            >
                                                ✅ Approve Institutional Partner
                                            </button>
                                            <button
                                                onClick={() => handleVerify(license.id, 'REJECTED')}
                                                disabled={verifyingId !== null}
                                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:bg-gray-300"
                                            >
                                                ❌ Reject Application
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
