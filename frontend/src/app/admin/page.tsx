"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import "./admin.css";

interface Category {
    id: string;
    name: string;
    escrowPercentage: number;
    maxModerationVP: number;
    maxVerificationVP: number;
    maxDisputeVP: number;
    maxLogisticsVP: number;
    maxFraudVP: number;
}

interface Trade {
    id: string;
    listing: { title: string };
    buyer: { fullName: string; email: string };
    seller: { fullName: string; email: string };
    offerVP: number;
    operationalEscrowVP: number;
}

interface AuditLog {
    id: string;
    action: string;
    details: string;
    adminId: string;
    createdAt: string;
}


interface SuccessorStatus {
    fullName: string;
    isUnlocked: boolean;
    unlockDate: string;
    isEligibleTime: boolean;
    timeRemainingMs: number;
}

export default function AdminPage() {
    const [stats, setStats] = useState<any>(null); // Existing stats
    const [successor, setSuccessor] = useState<SuccessorStatus | null>(null);
    const [frozen, setFrozen] = useState(false);
    const [code1, setCode1] = useState("");
    const [code2, setCode2] = useState("");
    const [fingerprintCode, setFingerprintCode] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [grantEmail, setGrantEmail] = useState("");
    const [grantAmount, setGrantAmount] = useState(0);
    const [grantReason, setGrantReason] = useState("");
    const [pendingTrades, setPendingTrades] = useState<Trade[]>([]);

    // Multi-bucket allocations state
    const [allocations, setAllocations] = useState<{ [tradeId: string]: { bucket: string; amountVP: number; justification: string }[] }>({});
    const [categories, setCategories] = useState<Category[]>([]);
    const [config, setConfig] = useState({
        feePercentage: 15,
        laborBaseline: 6,
        heir1: "",
        heir1Key: "",
        heir2: "",
        heir2Key: "",
        heir3: "",
        heir3Key: "",
        heir4: "",
        heir4Key: "",
        heir5: "",
        heir5Key: "",
        lastAdminActivity: ""
    });

    const [deathDate, setDeathDate] = useState("");
    const [deathPlace, setDeathPlace] = useState("");
    const [mokhtarName, setMokhtarName] = useState("");
    const [mokhtarLicense, setMokhtarLicense] = useState("");

    useEffect(() => {
        fetch("http://localhost:3001/admin/status")
            .then(res => res.json())
            .then(data => {
                setFrozen(data.isFrozen);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        fetchAuditLogs();
        fetchPendingTrades();
        fetchConfig();
        fetchCategories();
        fetchHeirConfig();
    }, []);

    const fetchCategories = () => {
        fetch("http://localhost:3001/admin/categories")
            .then(res => res.json())
            .then(setCategories);
    };

    const handleUpdateCat = (catId: string, field: keyof Category, value: string) => {
        const next = [...categories];
        const i = next.findIndex(c => c.id === catId);
        (next[i] as any)[field] = field === 'escrowPercentage' ? parseFloat(value) : parseInt(value);
        setCategories(next);
    };

    async function handleSaveCategory(cat: Category) {
        try {
            const res = await fetch(`http://localhost:3001/admin/categories/${cat.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...cat, code1, fingerprintCode })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Update Failed");
            }

            alert(`Category ${cat.name} updated successfully!`);
            fetchCategories();
        } catch (err: unknown) {
            alert("Error: " + (err as Error).message);
        }
    }

    const fetchConfig = () => {
        fetch("http://localhost:3001/admin/config")
            .then(res => res.json())
            .then(data => {
                setConfig(prev => ({ ...prev, ...data }));
            });
    };

    const fetchHeirConfig = async () => {
        if (!code1 || !fingerprintCode) return;
        try {
            const res = await fetch("http://localhost:3001/admin/config/heirs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code1, fingerprintCode })
            });
            if (res.ok) {
                const data = await res.json();
                setConfig(prev => ({ ...prev, ...data }));
            }
        } catch (err) { }
    };

    const fetchPendingTrades = () => {
        fetch("http://localhost:3001/admin/trades")
            .then(res => res.json())
            .then(setPendingTrades);
    };

    const fetchAuditLogs = () => {
        fetch("http://localhost:3001/admin/audit-logs")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setLogs(data);
                } else {
                    console.error("Audit logs response is not an array:", data);
                    setLogs([]);
                }
            })
            .catch(err => {
                console.error("Failed to fetch audit logs:", err);
                setLogs([]);
            });
    };

    // ... (previous interfaces)

    interface BusinessRequest {
        id: string;
        fullName: string;
        email: string;
        businessName: string;
        businessVerificationStatus: string;
    }

    interface CommunityRequest {
        id: string;
        fullName: string;
        email: string;
        communityRole: string;
        communityEvidence: string;
        communityVerificationStatus: string;
    }

    interface AmbassadorRequest {
        id: string;
        fullName: string;
        email: string;
        ambassadorStatus: string;
        risk: { maxConcentration: number; topPartner: string | null };
    }

    interface Bounty {
        id: string;
        title: string;
        description: string;
        rewardVP: number;
        status: string;
        assignee?: { fullName: string };
        submissionEvidence?: string;
    }

    interface ModerationFlag {
        id: string;
        reason: string;
        category: string;
        severity: string;
        matchedKeywords: string;
        listing: {
            title: string;
            seller: { fullName: string; email: string; reportCount: number };
        };
    }

    // ... inside AdminPage component ...
    const [pendingBusinesses, setPendingBusinesses] = useState<BusinessRequest[]>([]);
    const [pendingCommunity, setPendingCommunity] = useState<CommunityRequest[]>([]);
    const [pendingAmbassadors, setPendingAmbassadors] = useState<AmbassadorRequest[]>([]);
    const [submittedBounties, setSubmittedBounties] = useState<Bounty[]>([]);
    const [moderationFlags, setModerationFlags] = useState<ModerationFlag[]>([]);

    const fetchBounties = useCallback(() => {
        fetch("http://localhost:3001/bounties")
            .then(res => res.json())
            .then(data => {
                setSubmittedBounties(data.filter((b: Bounty) => b.status === 'SUBMITTED'));
            });
    }, []);

    const fetchModerationFlags = useCallback(() => {
        fetch("http://localhost:3001/admin/moderation/flags")
            .then(res => res.json())
            .then(setModerationFlags);
    }, []);

    useEffect(() => {
        fetchAuditLogs();
        fetchPendingTrades();
        fetchConfig();
        fetchCategories();
        fetchHeirConfig();
        fetchPendingBusinesses();
        fetchPendingCommunity();
        fetchPendingAmbassadors();
        fetchBounties();
        fetchModerationFlags();
    }, [fetchBounties, fetchModerationFlags]);

    const handleApproveBounty = async (bountyId: string) => {
        if (!confirm("Approve completion and release VP?")) return;
        try {
            await fetch(`http://localhost:3001/bounties/${bountyId}/complete`, { method: 'PUT' });
            alert("Bounty Completed & Paid!");
            fetchBounties();
        } catch (e) { alert("Error"); }
    };

    const handleFlagAction = async (flagId: string, action: 'approve' | 'reject') => {
        if (!code1 || !fingerprintCode) {
            alert("Security Codes Required");
            return;
        }
        try {
            await fetch(`http://localhost:3001/admin/moderation/flags/${flagId}/${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code1, fingerprintCode })
            });
            alert(`Flag ${action}d!`);
            fetchModerationFlags();
        } catch (e) { alert("Error processing flag"); }
    };

    const fetchPendingAmbassadors = () => {
        fetch("http://localhost:3001/admin/pending-ambassadors")
            .then(res => res.json())
            .then(setPendingAmbassadors);
    };

    const handleApproveAmbassador = async (user: AmbassadorRequest) => {
        if (user.risk.maxConcentration > 0.5) {
            if (!confirm(`⚠️ HIGH COLLUSION RISK: ${(user.risk.maxConcentration * 100).toFixed(1)}% of trades with same partner. Approve anyway?`)) return;
        }

        if (!confirm(`Approve ${user.fullName} as Ambassador?`)) return;

        try {
            await fetch(`http://localhost:3001/admin/${user.id}/approve-ambassador`, { method: 'PUT' });
            alert("Approved!");
            fetchPendingAmbassadors();
        } catch (e) { alert("Error"); }
    };


    const fetchPendingBusinesses = () => {
        fetch("http://localhost:3001/admin/pending-businesses")
            .then(res => res.json())
            .then(setPendingBusinesses);
    };

    const fetchPendingCommunity = () => {
        fetch("http://localhost:3001/admin/pending-community")
            .then(res => res.json())
            .then(setPendingCommunity);
    };

    const handleApproveBusiness = async (userId: string, currentBusinessName: string) => {
        const notes = prompt(`Enter Verification Notes for ${currentBusinessName} (e.g. Doc Numbers, Method):`);
        if (notes === null) return; // Cancelled

        const country = prompt("Enter Country Verified (e.g. Lebanon):", "Lebanon");
        if (country === null) return;

        const confirmText = `CONFIRM APPROVAL:\n\nBusiness: ${currentBusinessName}\nCountry: ${country}\nNotes: ${notes}\n\nProceed?`;
        if (!confirm(confirmText)) return;

        try {
            const res = await fetch(`http://localhost:3001/users/${userId}/approve-business`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes, country, verifiedAt: new Date(), adminId: 'ADMIN_AC' })
            });

            if (res.ok) {
                alert("Business Approved & Documented ✅");
                fetchPendingBusinesses();
            }
        } catch (err) {
            alert("Error approving business");
        }
    };

    const handleApproveCommunity = async (req: CommunityRequest) => {
        let evidence: any = {};
        try { evidence = JSON.parse(req.communityEvidence); } catch (e) { }

        const confirmText = `APPROVE COMMUNITY ROLE 🎖️\n\nUser: ${req.fullName}\nRole: ${req.communityRole}\nEvidence: ${evidence.idPhotoUrl || 'N/A'}\n\nApprove and grant +Listings Bonus?`;
        if (!confirm(confirmText)) return;

        try {
            const res = await fetch(`http://localhost:3001/users/${req.id}/approve-community`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ verifierId: 'ADMIN_AC' })
            });

            if (res.ok) {
                alert(`Approved! User is now a Verified ${req.communityRole} 🎖️`);
                fetchPendingCommunity();
            }
        } catch (err) {
            alert("Error approving community request");
        }
    };

    // ... inside return JSX, before CATEGORY SETTINGS SECTION ...

    {/* BUSINESS VERIFICATION SECTION */ }
    <section className="admin-section" style={{ borderColor: '#3b82f6', backgroundColor: '#eff6ff' }}>
        <h2>🏢 Pending Business Verifications</h2>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: 20 }}>
            <strong>Protocol:</strong> Verify business registration documents and receipt of administrative fee via WhatsApp before approving.
        </p>

        {pendingBusinesses.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: '#666' }}>No pending verification requests.</p>
        ) : (
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Trading Name</th>
                        <th>Owner Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingBusinesses.map((biz) => (
                        <tr key={biz.id}>
                            <td><strong>{biz.businessName}</strong></td>
                            <td>{biz.fullName}</td>
                            <td>{biz.email}</td>
                            <td><span className="badge badge-warning">{biz.businessVerificationStatus}</span></td>
                            <td>
                                <button
                                    onClick={() => handleApproveBusiness(biz.id, biz.businessName)}
                                    className="admin-button-small"
                                    style={{ backgroundColor: '#16a34a', color: 'white', border: 'none' }}
                                >
                                    ✅ Approve Identity
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </section>

    {/* COMMUNITY VERIFICATION SECTION */ }
    <section className="admin-section" style={{ borderColor: '#84cc16', backgroundColor: '#ecfccb' }}>
        <h2>🧑‍🌾 Pending Community Requests</h2>
        <p style={{ fontSize: '0.85rem', color: '#3f6212', marginBottom: 20 }}>
            <strong>Protocol:</strong> Check ID and Certificate. Verify Tree Selfie (Optional for Gardeners).
        </p>

        {pendingCommunity.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: '#666' }}>No pending community requests.</p>
        ) : (
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Evidence</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingCommunity.map((req) => {
                        let ev: any = {};
                        try { ev = JSON.parse(req.communityEvidence); } catch (e) { }
                        return (
                            <tr key={req.id}>
                                <td><strong>{req.fullName}</strong><br /><small>{req.email}</small></td>
                                <td><span className="badge" style={{ backgroundColor: '#d97706', color: 'white' }}>{req.communityRole}</span></td>
                                <td>
                                    <a href={ev.idPhotoUrl} target="_blank" className="text-blue-600 underline text-xs mr-2">ID Photo</a>
                                    {req.communityRole === 'GARDENER' && ev.optionalTreeSelfieUrl && (
                                        <a href={ev.optionalTreeSelfieUrl} target="_blank" className="text-green-600 underline text-xs">🌳 Selfie</a>
                                    )}
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleApproveCommunity(req)}
                                        className="admin-button-small"
                                        style={{ backgroundColor: '#65a30d', color: 'white', border: 'none' }}
                                    >
                                        ✅ Verify & Grant Limit
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        )}
    </section>

    {/* AMBASSADOR APPLICATIONS SECTION */ }
    <section className="admin-section" style={{ borderColor: '#8b5cf6', backgroundColor: '#f5f3ff' }}>
        <h2>👑 Ambassador Applications</h2>
        <p style={{ fontSize: '0.85rem', color: '#5b21b6', marginBottom: 20 }}>
            <strong>Protocol:</strong> Review Collusion Risk. Reject if &gt;30% concentration with single partner.
        </p>

        {pendingAmbassadors.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: '#666' }}>No pending ambassador applications.</p>
        ) : (
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Collusion Risk</th>
                        <th>Top Partner</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingAmbassadors.map((req) => (
                        <tr key={req.id}>
                            <td><strong>{req.fullName}</strong><br /><small>{req.email}</small></td>
                            <td>
                                <span className={`badge ${req.risk.maxConcentration > 0.3 ? 'badge-danger' : 'badge-success'}`}>
                                    {(req.risk.maxConcentration * 100).toFixed(1)}% Concentration
                                </span>
                            </td>
                            <td><small>{req.risk.topPartner || 'N/A'}</small></td>
                            <td>
                                <button
                                    onClick={() => handleApproveAmbassador(req)}
                                    className="admin-button-small"
                                    style={{ backgroundColor: '#7c3aed', color: 'white', border: 'none' }}
                                >
                                    ✅ Grant Status
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </section>

    {/* BOUNTY MANAGEMENT SECTION */ }
    <section className="admin-section" style={{ borderColor: '#f59e0b', backgroundColor: '#fffbeb' }}>
        <h2>🏆 Bounty Review</h2>
        {submittedBounties.length === 0 ? (
            <p className="no-data">No submitted bounties pending review.</p>
        ) : (
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Task</th>
                        <th>Assignee</th>
                        <th>Evidence</th>
                        <th>Reward</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {submittedBounties.map((b) => (
                        <tr key={b.id}>
                            <td>{b.title}</td>
                            <td>{b.assignee?.fullName}</td>
                            <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.submissionEvidence}</td>
                            <td className="font-bold text-green-600">{b.rewardVP} VP</td>
                            <td>
                                <button
                                    onClick={() => handleApproveBounty(b.id)}
                                    className="admin-button-small"
                                    style={{ backgroundColor: '#16a34a' }}
                                >
                                    Approve & Pay
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </section>

    {/* MODERATION QUEUE */ }
    <section className="admin-section" style={{ borderColor: '#ef4444', backgroundColor: '#fef2f2' }}>
        <h2>🛡️ Content Moderation Queue</h2>
        {moderationFlags.length === 0 ? (
            <p className="no-data">No flagged content.</p>
        ) : (
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Listing</th>
                        <th>Violation</th>
                        <th>Seller Risk</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {moderationFlags.map((flag) => (
                        <tr key={flag.id}>
                            <td><strong>{flag.listing.title}</strong></td>
                            <td>
                                <span className="badge badge-danger">{flag.category}</span>
                                <div className="text-xs mt-1 text-gray-500">{flag.reason}</div>
                            </td>
                            <td>
                                {flag.listing.seller.reportCount} Reports
                            </td>
                            <td className="flex gap-2">
                                <button
                                    onClick={() => handleFlagAction(flag.id, 'approve')}
                                    className="admin-button-small"
                                    style={{ backgroundColor: '#16a34a' }}
                                >
                                    Allow
                                </button>
                                <button
                                    onClick={() => handleFlagAction(flag.id, 'reject')}
                                    className="admin-button-small"
                                    style={{ backgroundColor: '#dc2626' }}
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </section>

    async function handleGrant() {
        try {
            const res = await fetch("http://localhost:3001/admin/grant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: grantEmail,
                    amount: Number(grantAmount),
                    reason: grantReason,
                    code1,
                    fingerprintCode
                })
            });

            if (!res.ok) throw new Error("Grant Failed");

            alert(`Successfully granted ${grantAmount} VP to ${grantEmail}`);
            setGrantEmail("");
            setGrantAmount(0);
            setGrantReason("");
            fetchAuditLogs(); // Refresh logs
        } catch (err: unknown) {
            alert("Error: " + (err as Error).message);
        }
    }

    async function handleUpdateConfig() {
        try {
            const res = await fetch("http://localhost:3001/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    feePercentage: Number(config.feePercentage),
                    laborBaseline: Number(config.laborBaseline),
                    heir1: config.heir1,
                    heir1Key: config.heir1Key,
                    heir2: config.heir2,
                    heir2Key: config.heir2Key,
                    heir3: config.heir3,
                    heir3Key: config.heir3Key,
                    heir4: config.heir4,
                    heir4Key: config.heir4Key,
                    heir5: config.heir5,
                    heir5Key: config.heir5Key,
                    code1,
                    fingerprintCode
                })
            });

            if (!res.ok) throw new Error("Config Update Failed");
            alert("Platform settings & Heirloom data updated successfully!");
            fetchConfig();
            fetchHeirConfig();
        } catch (err: unknown) {
            alert("Error: " + (err as Error).message);
        }
    }

    const handleAddAllocation = (tradeId: string) => {
        const current = allocations[tradeId] || [];
        setAllocations({
            ...allocations,
            [tradeId]: [...current, { bucket: "MODERATION", amountVP: 0, justification: "" }]
        });
    };

    const handleUpdateAllocation = (tradeId: string, index: number, field: string, value: any) => {
        const current = [...(allocations[tradeId] || [])];
        current[index] = { ...current[index], [field]: field === 'amountVP' ? Number(value) : value };
        setAllocations({ ...allocations, [tradeId]: current });
    };

    const handleRemoveAllocation = (tradeId: string, index: number) => {
        const current = (allocations[tradeId] || []).filter((_, i) => i !== index);
        setAllocations({ ...allocations, [tradeId]: current });
    };

    async function handleVerifyTrade(tradeId: string) {
        const tradeAllocations = allocations[tradeId] || [];
        try {
            const res = await fetch(`http://localhost:3001/admin/trades/${tradeId}/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bucketAllocations: tradeAllocations,
                    code1,
                    fingerprintCode
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Verification Failed");
            }

            alert("Trade Verified & Unused Escrow Refunded!");
            fetchPendingTrades();
            fetchAuditLogs();
            // Clear allocations for this trade
            const nextAllocations = { ...allocations };
            delete nextAllocations[tradeId];
            setAllocations(nextAllocations);
        } catch (err: unknown) {
            alert("Error: " + (err as Error).message);
        }
    }

    async function handleToggleFreeze() {
        const newStatus = !frozen;
        try {
            const res = await fetch("http://localhost:3001/admin/freeze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    frozen: newStatus,
                    code1,
                    code2,
                    fingerprintCode
                })
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(JSON.parse(errorText).message || "Action Failed");
            }

            setFrozen(newStatus);
            setMessage(`System is now ${newStatus ? "FROZEN ❄️" : "ACTIVE ✅"}`);
            fetchAuditLogs(); // Refresh logs
            setCode1("");
            setCode2("");
        } catch (err: unknown) {
            alert((err as Error).message);
        }
    }

    if (loading) return <div style={{ padding: 40 }}>Loading Admin Panel...</div>;

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>🛡️ Admin Dashboard</h1>
                {frozen && <span style={{ color: 'red', fontWeight: 'bold' }}>⚠️ KILL SWITCH ACTIVE</span>}
            </header>

            <div className="admin-grid">
                {/* SECURITY CODES */}
                <div className="admin-section">
                    <h2>🔑 Security Authorization</h2>
                    <div className="admin-input-group">
                        <label htmlFor="code1">Security Code Alpha</label>
                        <input
                            id="code1"
                            type="password"
                            className="admin-input"
                            value={code1}
                            onChange={e => setCode1(e.target.value)}
                        />
                    </div>
                    <div className="admin-input-group" style={{ marginTop: 15 }}>
                        <label htmlFor="code2">Security Code Beta</label>
                        <input
                            id="code2"
                            type="password"
                            className="admin-input"
                            value={code2}
                            onChange={e => setCode2(e.target.value)}
                        />
                    </div>
                    <div className="admin-input-group" style={{ marginTop: 15 }}>
                        <label htmlFor="fingerprintCode">Fingerprint Auth Code</label>
                        <input
                            id="fingerprintCode"
                            type="password"
                            className="admin-input"
                            value={fingerprintCode}
                            onChange={e => setFingerprintCode(e.target.value)}
                        />
                    </div>
                </div>

                {/* KILL SWITCH SECTION */}
                <div className="admin-section" style={{ borderColor: frozen ? '#dc2626' : '#eee' }}>
                    <h2>🚨 Protocol 0: Kill Switch</h2>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: 20 }}>
                        Instantly freezes all trade confirmations platform-wide. Requires Security Code Alpha & Beta.
                    </p>

                    <button
                        onClick={handleToggleFreeze}
                        className={`admin-button ${frozen ? 'admin-button-success' : 'admin-button-danger'}`}
                        style={{ fontSize: '1.2rem' }}
                    >
                        {frozen ? "DEACTIVATE Kill Switch" : "ACTIVATE Kill Switch"}
                    </button>
                </div>
            </div>

            {/* CATEGORY SETTINGS SECTION */}
            <section className="admin-section">
                <h2>📁 Category Operational Escrow Config</h2>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: 20 }}>
                    Define max escrow percentages and cost caps per category.
                    <em> Changes only affect new trades.</em>
                </p>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Escrow %</th>
                                <th>Mod. Cap</th>
                                <th>Verif. Cap</th>
                                <th>Disp. Cap</th>
                                <th>Logis. Cap</th>
                                <th>Fraud Cap</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.id}>
                                    <td><strong>{cat.name}</strong></td>
                                    <td>
                                        <input
                                            type="number"
                                            className="admin-input-small"
                                            value={cat.escrowPercentage}
                                            onChange={e => {
                                                const next = [...categories];
                                                const i = next.findIndex(c => c.id === cat.id);
                                                next[i].escrowPercentage = Number(e.target.value);
                                                setCategories(next);
                                            }}
                                        />%
                                    </td>
                                    <td><input type="number" className="admin-input-small" value={cat.maxModerationVP} onChange={e => handleUpdateCat(cat.id, 'maxModerationVP', e.target.value)} /></td>
                                    <td><input type="number" className="admin-input-small" value={cat.maxVerificationVP} onChange={e => handleUpdateCat(cat.id, 'maxVerificationVP', e.target.value)} /></td>
                                    <td><input type="number" className="admin-input-small" value={cat.maxDisputeVP} onChange={e => handleUpdateCat(cat.id, 'maxDisputeVP', e.target.value)} /></td>
                                    <td><input type="number" className="admin-input-small" value={cat.maxLogisticsVP} onChange={e => handleUpdateCat(cat.id, 'maxLogisticsVP', e.target.value)} /></td>
                                    <td><input type="number" className="admin-input-small" value={cat.maxFraudVP} onChange={e => handleUpdateCat(cat.id, 'maxFraudVP', e.target.value)} /></td>
                                    <td>
                                        <button
                                            onClick={() => handleSaveCategory(cat)}
                                            className="admin-button-small"
                                            title="Update category escrow and caps"
                                        >
                                            Save
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* PLATFORM SETTINGS SECTION (Simplified) */}
            <section className="admin-section admin-section-settings">
                <h2>⚙️ General Platform Settings</h2>
                <div className="admin-grid">
                    <div className="admin-input-group">
                        <label htmlFor="laborBaseline">Default Labor Baseline (%)</label>
                        <input
                            id="laborBaseline"
                            type="number"
                            className="admin-input"
                            value={config.laborBaseline}
                            onChange={e => setConfig({ ...config, laborBaseline: Number(e.target.value) })}
                        />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <p style={{ fontSize: '0.8rem', color: '#666' }}>* Requires &quot;Security Code 1 (Alpha)&quot;.</p>
                        <button
                            onClick={handleUpdateConfig}
                            className="admin-button admin-button-purple"
                        >
                            Update Baseline
                        </button>
                    </div>
                </div>
            </section>

            {/* COMMUNITY GRANT SECTION */}
            <section className="admin-section">
                <h2>🤝 Community Grants</h2>
                <div className="admin-grid">
                    <div className="admin-input-group">
                        <label htmlFor="grantEmail">Recipient Email</label>
                        <input
                            id="grantEmail"
                            type="email"
                            className="admin-input"
                            placeholder="demo@meetbarter.com"
                            title="Recipient Email"
                            value={grantEmail}
                            onChange={e => setGrantEmail(e.target.value)}
                        />
                    </div>
                    <div className="admin-input-group">
                        <label htmlFor="grantAmount">Amount (VP)</label>
                        <input
                            id="grantAmount"
                            type="number"
                            className="admin-input"
                            placeholder="e.g. 1000"
                            title="Amount in VP"
                            value={grantAmount}
                            onChange={e => setGrantAmount(Number(e.target.value))}
                        />
                    </div>
                    <div className="admin-input-group" style={{ gridColumn: '1 / -1' }}>
                        <label htmlFor="grantReason">Reason / Justification</label>
                        <input
                            id="grantReason"
                            type="text"
                            className="admin-input"
                            placeholder="e.g. Helped clean community garden..."
                            title="Reason for Grant"
                            value={grantReason}
                            onChange={e => setGrantReason(e.target.value)}
                        />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <p style={{ fontSize: '0.8rem', color: '#666' }}>* Requires Security Code Alpha.</p>
                        <button
                            onClick={handleGrant}
                            className="admin-button admin-button-primary"
                        >
                            Issue Grant
                        </button>
                    </div>
                </div>
            </section>

            {/* TRADE VERIFICATION SECTION */}
            <section className="admin-section admin-section-trades">
                <h2>📦 Pending Verification & Cost Recovery</h2>
                <div className="admin-notice">
                    <strong>Notice:</strong> Operational escrow (standardized at 15%) serves as the maximum administrative recovery budget.
                    Unused credits are automatically returned to the buyer ledger upon verification.
                </div>
                {pendingTrades.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No trades pending verification.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {pendingTrades.map((trade) => (
                            <div key={trade.id} className="trade-card">
                                <div className="trade-card-header">
                                    <div>
                                        <strong>{trade.listing.title}</strong>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            Buyer: {trade.buyer.fullName} | Seller: {trade.seller.fullName}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#2563eb' }}>{trade.offerVP} VP</div>
                                        <div style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 'bold' }}>
                                            Administrative Budget: {trade.operationalEscrowVP} VP (15%)
                                        </div>
                                    </div>
                                </div>

                                <div className="allocation-container">
                                    <h3>Operational Cost Allocations</h3>
                                    {(allocations[trade.id] || []).map((alloc, idx) => (
                                        <div key={idx} className="allocation-row">
                                            <select
                                                className="admin-input"
                                                value={alloc.bucket}
                                                onChange={e => handleUpdateAllocation(trade.id, idx, 'bucket', e.target.value)}
                                                title="Allocation Bucket"
                                            >
                                                <option value="MODERATION">Moderation Review</option>
                                                <option value="VERIFICATION">Identity/Listing Verification</option>
                                                <option value="DISPUTE">Dispute Handling</option>
                                                <option value="LOGISTICS">Logistics Coordination</option>
                                                <option value="FRAUD">Fraud Investigation</option>
                                            </select>
                                            <input
                                                type="number"
                                                className="admin-input"
                                                placeholder="Amount VP"
                                                title="Amount in VP"
                                                value={alloc.amountVP}
                                                onChange={e => handleUpdateAllocation(trade.id, idx, 'amountVP', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className="admin-input"
                                                placeholder="Mandatory Justification"
                                                title="Justification for Allocation"
                                                value={alloc.justification}
                                                style={{ flex: 2 }}
                                                onChange={e => handleUpdateAllocation(trade.id, idx, 'justification', e.target.value)}
                                            />
                                            <button
                                                className="admin-button-remove"
                                                onClick={() => handleRemoveAllocation(trade.id, idx)}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        className="admin-button-add"
                                        onClick={() => handleAddAllocation(trade.id)}
                                    >
                                        + Add Allocation Bucket
                                    </button>
                                </div>

                                <div className="trade-card-footer">
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        <strong>Calculation:</strong> {trade.operationalEscrowVP} VP (15% Allocation) - {(allocations[trade.id] || []).reduce((sum, a) => sum + a.amountVP, 0)} VP (Actual Recovery) =
                                        <span style={{ color: '#059669', fontWeight: 'bold' }}>
                                            {trade.operationalEscrowVP - (allocations[trade.id] || []).reduce((sum, a) => sum + a.amountVP, 0)} Credits Refund to Buyer
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleVerifyTrade(trade.id)}
                                        className="admin-button admin-button-primary"
                                        style={{ backgroundColor: '#111827' }}
                                    >
                                        Confirm Verification & Refund
                                    </button>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 10 }}>
                                    * Protocol: Any portion of the 15% budget not allocated to operational costs is automatically returned to the buyer ledger.
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* SUCCESSION & CONTINUITY SECTION */}
            <section className="admin-section" style={{ backgroundColor: '#fff7ed', borderColor: '#fdba74' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>🧬 Succession & Continuity Protocol</h2>
                    <button className="admin-button-small" onClick={fetchHeirConfig}>🔓 Reveal Heirs</button>
                </div>
                <div className="admin-grid">
                    <div className="admin-notice" style={{ gridColumn: '1 / -1', backgroundColor: '#ffedd5', color: '#9a3412' }}>
                        <strong>Survival Protocol:</strong> The following individuals are the sole designated heirs and owners of this platform.
                        Access recovery is restricted: It requires **1 Year of Admin Inactivity** and a **verified Death Certificate**.
                    </div>

                    <div className="admin-notice" style={{ gridColumn: '1 / -1', backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                        🕒 <strong>Last Owner Activity:</strong> {config.lastAdminActivity ? new Date(config.lastAdminActivity).toLocaleString() : "Never"}
                        <br />
                        <span style={{ fontSize: '0.8rem' }}> (Succession protocol unlocks after 365 days of inactivity)</span>
                    </div>

                    <div className="heir-card" style={{ gridColumn: '1 / -1', padding: 15, backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: 8 }}>
                        <h3>🧬 Primary Successor: Gia Alkoroum</h3>
                        <div style={{ marginTop: 10 }}>
                            <strong>Status:</strong> 🔒 <span style={{ color: 'red', fontWeight: 'bold' }}>LOCKED (Underage)</span>
                            <br />
                            <strong>Born:</strong> Sep 4, 2024
                            <br />
                            <strong>Unlock Date:</strong> Sep 4, 2045
                            <br />
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                Automatic unlocking enabled. System checks eligibility daily.
                            </span>
                        </div>
                    </div>

                    <div className="heir-management" style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                        <div className="heir-card" style={{ padding: 15, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #fed7aa' }}>
                            <label>Heir 1 (Guardian)</label>
                            <input className="admin-input" value={config.heir1} onChange={e => setConfig({ ...config, heir1: e.target.value })} placeholder="Name" />
                            <input className="admin-input" type="password" value={config.heir1Key} onChange={e => setConfig({ ...config, heir1Key: e.target.value })} placeholder="Fingerprint Code" style={{ marginTop: 5 }} />
                        </div>
                        <div className="heir-card" style={{ padding: 15, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #fed7aa' }}>
                            <label>Heir 2 (Successor)</label>
                            <input className="admin-input" title="Heir 2 Name" value={config.heir2} onChange={e => setConfig({ ...config, heir2: e.target.value })} placeholder="Name" />
                            <input className="admin-input" type="password" title="Heir 2 Fingerprint" value={config.heir2Key} onChange={e => setConfig({ ...config, heir2Key: e.target.value })} placeholder="Fingerprint Code" style={{ marginTop: 5 }} />
                        </div>
                        <div className="heir-card" style={{ padding: 15, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #fed7aa' }}>
                            <label>Heir 3 (Successor)</label>
                            <input className="admin-input" title="Heir 3 Name" value={config.heir3} onChange={e => setConfig({ ...config, heir3: e.target.value })} placeholder="Name" />
                            <input className="admin-input" type="password" title="Heir 3 Fingerprint" value={config.heir3Key} onChange={e => setConfig({ ...config, heir3Key: e.target.value })} placeholder="Fingerprint" style={{ marginTop: 5 }} />
                        </div>
                        <div className="heir-card" style={{ padding: 15, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #fed7aa' }}>
                            <label>Heir 4 (Successor)</label>
                            <input className="admin-input" title="Heir 4 Name" value={config.heir4} onChange={e => setConfig({ ...config, heir4: e.target.value })} placeholder="Name" />
                            <input className="admin-input" type="password" title="Heir 4 Fingerprint" value={config.heir4Key} onChange={e => setConfig({ ...config, heir4Key: e.target.value })} placeholder="Fingerprint" style={{ marginTop: 5 }} />
                        </div>
                        <div className="heir-card" style={{ padding: 15, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #fed7aa' }}>
                            <label>Heir 5 (Successor)</label>
                            <input className="admin-input" title="Heir 5 Name" value={config.heir5} onChange={e => setConfig({ ...config, heir5: e.target.value })} placeholder="Name" />
                            <input className="admin-input" type="password" title="Heir 5 Fingerprint" value={config.heir5Key} onChange={e => setConfig({ ...config, heir5Key: e.target.value })} placeholder="Fingerprint" style={{ marginTop: 5 }} />
                        </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <button className="admin-button" style={{ backgroundColor: '#f97316' }} onClick={handleUpdateConfig}>Save Heirloom Updates</button>
                    </div>

                    <div className="emergency-form" style={{ gridColumn: '1 / -1', marginTop: 30, padding: 20, border: '1px dashed #fdba74', borderRadius: 8 }}>
                        <h3>🆘 Emergency Heir Override</h3>
                        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: 15 }}>Requires all 3 Succession Keys + Verified Death Registration.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#9a3412' }}>Date of Death</label>
                                <input type="date" className="admin-input" value={deathDate} onChange={e => setDeathDate(e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#9a3412' }}>Place of Death</label>
                                <input placeholder="Location (e.g. Beirut)" className="admin-input" value={deathPlace} onChange={e => setDeathPlace(e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#9a3412' }}>Mokhtar Full Name</label>
                                <input placeholder="Legal Certifier" className="admin-input" value={mokhtarName} onChange={e => setMokhtarName(e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#9a3412' }}>Mokhtar License/Credentials</label>
                                <input placeholder="Official ID / License" className="admin-input" value={mokhtarLicense} onChange={e => setMokhtarLicense(e.target.value)} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <input type="password" placeholder="Heir 1 Key" className="admin-input" id="heirKey1" style={{ flex: 1, minWidth: '150px' }} />
                            <input type="password" placeholder="Heir 2 Key" className="admin-input" id="heirKey2" style={{ flex: 1, minWidth: '150px' }} />
                            <input type="password" placeholder="Heir 3 Key" className="admin-input" id="heirKey3" style={{ flex: 1, minWidth: '150px' }} />
                            <input type="password" placeholder="Heir 4 Key" className="admin-input" id="heirKey4" style={{ flex: 1, minWidth: '150px' }} />
                            <input type="password" placeholder="Heir 5 Key" className="admin-input" id="heirKey5" style={{ flex: 1, minWidth: '150px' }} />
                        </div>
                        <button
                            className="admin-button"
                            style={{ marginTop: 15, backgroundColor: '#9a3412', color: 'white' }}
                            onClick={async () => {
                                const key1 = (document.getElementById('heirKey1') as HTMLInputElement).value;
                                const key2 = (document.getElementById('heirKey2') as HTMLInputElement).value;
                                const key3 = (document.getElementById('heirKey3') as HTMLInputElement).value;
                                const key4 = (document.getElementById('heirKey4') as HTMLInputElement).value;
                                const key5 = (document.getElementById('heirKey5') as HTMLInputElement).value;

                                try {
                                    const res = await fetch("http://localhost:3001/admin/emergency-unlock", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            key1, key2, key3, key4, key5,
                                            deathDate, deathPlace,
                                            mokhtarName, mokhtarLicense
                                        })
                                    });
                                    if (!res.ok) {
                                        const errData = await res.json();
                                        throw new Error(errData.message || "Emergency Override Denied.");
                                    }
                                    const data = await res.json();
                                    alert(`DANGER: Heir Protocol Activated.\n\nAlpha: ${data.alpha}\nBeta: ${data.beta}\nFingerprint: ${data.fingerprint}`);
                                } catch (err: any) {
                                    alert(err.message);
                                }
                            }}
                        >
                            Authorize Emergency Retrieval
                        </button>
                    </div>
                </div>
            </section>
            <section className="admin-section">
                <h2>📜 System Audit Logs</h2>
                <table className="audit-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>Admin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log: AuditLog) => (
                            <tr key={log.id}>
                                <td>{new Date(log.createdAt).toLocaleString()}</td>
                                <td style={{ fontWeight: 'bold' }}>{log.action}</td>
                                <td style={{ fontFamily: 'monospace' }}>{log.details}</td>
                                <td>{log.adminId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {message && <div style={{ marginTop: 20, padding: 15, backgroundColor: '#f3f4f6', borderRadius: 8, textAlign: 'center' }}>{message}</div>}

            <footer style={{ marginTop: 60, textAlign: 'center', borderTop: '1px solid #eee', paddingTop: 20, color: '#666' }}>
                <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>&larr; Back to Marketplace</Link>
            </footer>
        </div>
    );
}
