"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Link from "next/link";
import { API_BASE_URL } from "@/config/api";
import OtpQueueWidget from "@/components/admin/OtpQueueWidget";
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
    status: string;
    justification: string;
}

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

interface SubscriptionRequest {
    id: string;
    user: { fullName: string; email: string };
    tier: string;
    amount: number;
    currency: string;
    status: string;
}

interface LicenseRequest {
    id: string;
    status: string;
    evidence: string;
    businessName: string;
    registrationNumber: string;
    permitType: string;
    user: { fullName: string; email: string };
}

type Protocol = "COMMAND_CENTER" | "TECHNICAL" | "COMPLIANCE" | "LEGAL" | "BOARD" | "AUDITOR" | "STRATEGIC";

interface AdminConfig {
    feePercentage: number;
    laborBaseline: number;
    ambassadorTradeThreshold?: number;
    legalEntityId?: string;
    [key: string]: string | number | undefined;
}

interface Intelligence {
    anomaliesDetected: boolean;
    topSearches: { intentVector: string; _count: { _all: number } }[];
    opportunityCategories: { category: { name: string }; opportunityIndex: number }[];
    liquidityHealth: { category: { name: string }; tradeVelocity: number }[];
    trustRisk: { fullName: string; userId: string; totalTrades: number; riskScore: number }[];
    economicPulse: { velocity: number; totalVolumeVP: number; circulationVP: number };
}

interface CityPulse {
    city: string;
    country: string;
    isCrisisActive: boolean;
}

interface BusinessRegistryEntry {
    id: string;
    businessName: string;
    fullName: string;
    verificationLevel: number;
    globalTrustScore: number;
    createdAt: string;
}

interface ForensicResults {
    userId: string;
    auditLogs: { action: string; createdAt: string; ipAddress: string }[];
    tradeActivity: { id: string; status: string; operationCosts: unknown[] }[];
}

export default function AdminPage() {
    const [protocol, setProtocol] = useState<Protocol>("COMMAND_CENTER");
    const [loading, setLoading] = useState(true);
    const [frozen, setFrozen] = useState(false);
    const [message, setMessage] = useState("");

    // Security Codes
    const [code1, setCode1] = useState("");
    const [code2, setCode2] = useState("");
    const [fingerprintCode, setFingerprintCode] = useState("");
    const [newAlpha, setNewAlpha] = useState("");
    const [newBeta, setNewBeta] = useState("");
    const [newFingerprint, setNewFingerprint] = useState("");

    // Data State
    const [logs, setLogs] = useState<{ id: string; action: string; details: string; adminId: string; createdAt: string }[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [config, setConfig] = useState<AdminConfig & Record<string, string | number | undefined>>({ feePercentage: 15, laborBaseline: 6 });
    const [disputedTrades, setDisputedTrades] = useState<Trade[]>([]);
    const [pendingBusinesses, setPendingBusinesses] = useState<BusinessRequest[]>([]);
    const [pendingCommunity, setPendingCommunity] = useState<CommunityRequest[]>([]);
    const [pendingAmbassadors, setPendingAmbassadors] = useState<AmbassadorRequest[]>([]);
    const [pendingSubscriptions, setPendingSubscriptions] = useState<SubscriptionRequest[]>([]);
    const [pendingLicenses, setPendingLicenses] = useState<LicenseRequest[]>([]);
    const [submittedBounties, setSubmittedBounties] = useState<Bounty[]>([]);
    const [moderationFlags, setModerationFlags] = useState<ModerationFlag[]>([]);
    const [cityPulse, setCityPulse] = useState<CityPulse[]>([]);
    const [intelligence, setIntelligence] = useState<Intelligence | null>(null);
    const [perfLogs, setPerfLogs] = useState<{ method: string; url: string; duration: number; timestamp: Date }[]>([]);
    const [businessRegistry, setBusinessRegistry] = useState<BusinessRegistryEntry[]>([]);
    const [forensicResults, setForensicResults] = useState<ForensicResults | null>(null);
    const socketRef = useRef<Socket | null>(null);

    // Grant State
    const [grantEmail, setGrantEmail] = useState("");
    const [grantAmount, setGrantAmount] = useState(0);
    const [grantReason, setGrantReason] = useState("");

    // Emergency/Death State
    const [deathDate, setDeathDate] = useState("");
    const [deathPlace, setDeathPlace] = useState("");
    const [mokhtarName, setMokhtarName] = useState("");
    const [mokhtarLicense, setMokhtarLicense] = useState("");

    // --- FETCH FUNCTIONS ---

    const fetchAuditLogs = useCallback(() => {
        fetch(`${API_BASE_URL}/admin/audit-logs`)
            .then(res => res.json())
            .then(data => setLogs(Array.isArray(data) ? data : []))
            .catch(() => setLogs([]));
    }, []);

    const fetchCategories = useCallback(() => {
        fetch(`${API_BASE_URL}/admin/categories`)
            .then(res => res.json())
            .then(setCategories);
    }, []);

    const fetchConfig = useCallback(() => {
        fetch(`${API_BASE_URL}/admin/config`)
            .then(res => res.json())
            .then(data => setConfig(prev => ({ ...prev, ...data })));
    }, []);

    const fetchHeirConfig = async () => {
        if (!code1 || !fingerprintCode) {
            alert("Security Codes Alpha + Fingerprint required to reveal keys.");
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/admin/config/heirs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code1, fingerprintCode })
            });
            if (res.ok) {
                const data = await res.json();
                setConfig((prev: AdminConfig) => ({ ...prev, ...data }));
            }
        } catch { }
    };

    const fetchCityPulse = useCallback(() => {
        fetch(`${API_BASE_URL}/city-pulse`)
            .then(res => res.json())
            .then(setCityPulse)
            .catch(() => { });
    }, []);

    const fetchDisputes = useCallback(() => {
        fetch(`${API_BASE_URL}/admin/disputes`)
            .then(res => res.json())
            .then(setDisputedTrades);
    }, []);

    const fetchPendingBusinesses = useCallback(() => {
        fetch(`${API_BASE_URL}/admin/pending-businesses`)
            .then(res => res.json())
            .then(setPendingBusinesses);
    }, []);

    const fetchPendingCommunity = useCallback(() => {
        fetch(`${API_BASE_URL}/admin/pending-community`)
            .then(res => res.json())
            .then(setPendingCommunity);
    }, []);

    const fetchPendingAmbassadors = useCallback(() => {
        fetch(`${API_BASE_URL}/admin/pending-ambassadors`)
            .then(res => res.json())
            .then(setPendingAmbassadors);
    }, []);

    const fetchPendingSubscriptions = useCallback(() => {
        fetch(`${API_BASE_URL}/subscriptions/pending`)
            .then(res => res.json())
            .then(setPendingSubscriptions)
            .catch(() => { });
    }, []);

    const fetchPendingLicenses = useCallback(() => {
        fetch(`${API_BASE_URL}/users/pending-licenses`)
            .then(res => res.json())
            .then(setPendingLicenses)
            .catch(() => { });
    }, []);

    const fetchBounties = useCallback(() => {
        fetch(`${API_BASE_URL}/bounties`)
            .then(res => res.json())
            .then(data => setSubmittedBounties(data.filter((b: Bounty) => b.status === "SUBMITTED")));
    }, []);

    const fetchIntelligence = useCallback(() => {
        fetch(`${API_BASE_URL}/admin/intelligence`)
            .then(res => res.json())
            .then(setIntelligence)
            .catch(() => { });
    }, []);

    const fetchModerationFlags = useCallback(() => {
        fetch(`${API_BASE_URL}/admin/moderation/flags`)
            .then(res => res.json())
            .then(setModerationFlags);
    }, []);

    const fetchBusinessRegistry = useCallback(() => {
        fetch(`${API_BASE_URL}/admin/business-registry`)
            .then(res => res.json())
            .then(setBusinessRegistry);
    }, []);

    const handleForensicScan = async (userId: string) => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/intelligence/forensic/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setForensicResults(data);
                setProtocol("STRATEGIC"); // Focus on tactical view
            }
        } catch { }
        setLoading(false);
    };

    useEffect(() => {
        // Socket for Real-Time Stats
        const socket = io(`${API_BASE_URL}/notifications`);
        socket.on("connect", () => {
            socket.emit("join_admin");
        });

        socket.on("system_stats", (data) => {
            if (data.type === "API_PERFORMANCE") {
                setPerfLogs(prev => [{ ...data.payload, timestamp: new Date(data.timestamp) }, ...prev].slice(0, 10));
            }
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        fetch(`${API_BASE_URL}/admin/status`)
            .then(res => res.json())
            .then(data => setFrozen(data.isFrozen))
            .catch(() => { })
            .finally(() => setLoading(false));

        fetchAuditLogs();
        fetchConfig();
        fetchCategories();
        fetchCityPulse();
        fetchPendingBusinesses();
        fetchPendingCommunity();
        fetchPendingAmbassadors();
        fetchPendingSubscriptions();
        fetchPendingLicenses();
        fetchBounties();
        fetchModerationFlags();
        fetchDisputes();
        fetchIntelligence();
        fetchBusinessRegistry();
    }, [fetchAuditLogs, fetchConfig, fetchCategories, fetchCityPulse, fetchPendingBusinesses, fetchPendingCommunity, fetchPendingAmbassadors, fetchPendingSubscriptions, fetchPendingLicenses, fetchBounties, fetchModerationFlags, fetchDisputes, fetchIntelligence, fetchBusinessRegistry]);

    // --- ACTION HANDLERS ---

    const handleToggleFreeze = async () => {
        const newStatus = !frozen;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/freeze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ frozen: newStatus, code1, code2, fingerprintCode })
            });
            if (!res.ok) throw new Error((await res.json()).message || "Action Failed");
            setFrozen(newStatus);
            setMessage(`System is now ${newStatus ? "FROZEN ❄️" : "ACTIVE ✅"}`);
            fetchAuditLogs();
            alert("Success!");
        } catch (err: unknown) { alert(err instanceof Error ? err.message : "Action Failed"); }
    };

    const handleRotateCodes = async () => {
        if (!confirm("Rotate Master Keys? Irreversible.")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/config/rotate-codes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code1, fingerprintCode, newAlpha, newBeta, newFingerprint })
            });
            if (!res.ok) throw new Error("Key Rotation Failed");
            alert("Success!");
        } catch (err: unknown) { alert(err instanceof Error ? err.message : "Action Failed"); }
    };

    const handleSaveCategory = async (cat: Category) => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/categories/${cat.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...cat, code1, fingerprintCode })
            });
            if (res.ok) alert("Category updated.");
        } catch { alert("Error."); }
    };

    const handleUpdateCat = (catId: string, field: keyof Category, value: string) => {
        const next = [...categories];
        const i = next.findIndex(c => c.id === catId);
        if (i !== -1) {
            if (field === 'escrowPercentage') {
                next[i][field] = parseFloat(value);
            } else {
                // TypeScript limitation: numeric fields need explicit casting
                (next[i][field] as number) = parseInt(value);
            }
            setCategories(next);
        }
    };

    const handleToggleCrisis = async (city: string, country: string, currentStatus: boolean) => {
        if (!confirm(`Override Crisis Protocol for ${city}?`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/config/crisis-override`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ city, country, active: !currentStatus, code1, fingerprintCode })
            });
            if (res.ok) fetchCityPulse();
        } catch { }
    };

    const handleApproveBusiness = async (userId: string, name: string) => {
        const notes = prompt(`Notes for ${name}:`);
        if (!notes) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/approve-business`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes, code1, fingerprintCode })
            });
            if (!res.ok) throw new Error("Approval Failed: Security Codes possibly invalid.");
            fetchPendingBusinesses();
            alert("Business Approved & Referrer Rewarded.");
        } catch (err: unknown) { alert(err instanceof Error ? err.message : "Action Failed"); }
    };

    const handleApproveCommunity = async (req: CommunityRequest) => {
        if (!confirm(`Approve ${req.fullName}?`)) return;
        try {
            await fetch(`${API_BASE_URL}/users/${req.id}/approve-community`, { method: "PUT" });
            fetchPendingCommunity();
        } catch { }
    };

    const handleApproveAmbassador = async (user: AmbassadorRequest) => {
        if (!confirm(`Confirm Ambassador Status for ${user.fullName}?`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users/${user.id}/approve-ambassador`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code1, fingerprintCode })
            });
            if (!res.ok) throw new Error("Ambassador Onboarding Failed");
            fetchPendingAmbassadors();
            alert("Ambassador Protocol Activated.");
        } catch (err: unknown) { alert(err instanceof Error ? err.message : "Action Failed"); }
    };

    const handleResolveDispute = async (tradeId: string, action: "RELEASE" | "REFUND") => {
        const notes = prompt("Resolution notes:");
        if (!notes) return;
        try {
            await fetch(`${API_BASE_URL}/admin/trades/${tradeId}/resolve-dispute`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, notes, code1, fingerprintCode })
            });
            fetchDisputes();
            fetchAuditLogs();
        } catch { }
    };

    const handleFlagAction = async (flagId: string, action: "approve" | "reject") => {
        try {
            await fetch(`${API_BASE_URL}/admin/moderation/flags/${flagId}/${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code1, fingerprintCode })
            });
            fetchModerationFlags();
        } catch { }
    };

    const handleGrant = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/grant`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: grantEmail, amount: grantAmount, reason: grantReason, code1, fingerprintCode })
            });
            if (res.ok) { alert("Grant Issued."); fetchAuditLogs(); }
        } catch { }
    };

    const handleVerifySubscription = async (subId: string) => {
        if (!confirm("Confirm payment receipt and verify subscription?")) return;
        try {
            const adminId = "9d2c7649-9cf0-48fb-889a-1369e20615a6"; // TODO: Use real admin session if available
            await fetch(`${API_BASE_URL}/subscriptions/${subId}/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminId })
            });
            alert("Subscription Verified!");
            fetchPendingSubscriptions();
        } catch (err: unknown) { alert(err instanceof Error ? err.message : "Action Failed"); }
    };

    const handleVerifyLicense = async (licenseId: string) => {
        if (!confirm("Verify this Institutional License? This grants Level 3 status.")) return;
        try {
            const adminId = "9d2c7649-9cf0-48fb-889a-1369e20615a6";
            const res = await fetch(`${API_BASE_URL}/users/${licenseId}/verify-license`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminId, status: "VERIFIED", notes: "Verified via Admin Panel" })
            });
            if (!res.ok) throw new Error("Verification Failed");
            alert("License Verified! User upgraded to Level 3.");
            fetchPendingLicenses();
        } catch (err: unknown) { alert(err instanceof Error ? err.message : "Action Failed"); }
    };

    const handleApproveBounty = async (id: string) => {
        try {
            await fetch(`${API_BASE_URL}/admin/bounties/${id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code1, fingerprintCode })
            });
            fetchBounties();
        } catch { }
    };

    const handleExportVault = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/vault/export`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code1, fingerprintCode })
            });
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "vault_export.json";
            a.click();
        } catch { }
    };

    const handleUpdateConfig = async () => {
        try {
            await fetch(`${API_BASE_URL}/admin/config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...config, code1, fingerprintCode })
            });
            alert("Updated.");
        } catch { }
    };

    // --- RENDER HELPERS ---

    const renderProtocolCard = (id: Protocol, title: string, description: string, icon: string, colorClass: string) => (
        <div className={`admin-portal-card ${colorClass}`} onClick={() => setProtocol(id)}>
            <div className="admin-portal-icon">{icon}</div>
            <div className="admin-portal-info">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
            <div className="admin-portal-arrow">→</div>
        </div>
    );

    const renderPortalHeader = (title: string, subtitle: string) => (
        <header className="admin-header">
            <div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setProtocol("COMMAND_CENTER")} className="text-blue-600 hover:underline text-sm mb-1">← Command Center</button>
                    <span className="text-gray-400 text-sm mb-1">/ {title}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-500">{subtitle}</p>
            </div>
            <Link href="/" className="admin-back-link">Return to Platform</Link>
        </header>
    );

    if (loading) return <div className="admin-loader">Synchronizing Administrative Ledger...</div>;

    // --- VIEW LOGIC ---

    if (protocol === "COMMAND_CENTER") {
        return (
            <div className="admin-container">
                <header className="admin-header">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Institutional Command Center</h1>
                        <p className="text-gray-500">MeetBarter Foundation NGO Protocol Selection</p>
                    </div>
                    <Link href="/" className="admin-back-link">Return to Platform</Link>
                </header>
                <div className="admin-notice">
                    <strong>Notice:</strong> All administrative actions are recorded in the tamper-evident SHA-256 Audit Ledger.
                </div>

                <div className="mb-8">
                    <OtpQueueWidget />
                </div>

                <div className="admin-portal-grid">
                    {renderProtocolCard("TECHNICAL", "Technical Handover (CTO)", "Lead Developer focus: server maintenance, master key security.", "🛠️", "portal-tech")}
                    {renderProtocolCard("COMPLIANCE", "Compliance Verification", "Operations Lead focus: NGO registration and Level 2/3 verification.", "📋", "portal-compliance")}
                    {renderProtocolCard("LEGAL", "Dispute Resolution", "Legal Officer focus: Trade conflict settlement.", "⚖️", "portal-legal")}
                    {renderProtocolCard("BOARD", "Disaster Recovery (Succession)", "Board focus: Heartbeat monitoring and Heirloom drills.", "🛡️", "portal-board")}
                    {renderProtocolCard("STRATEGIC", "Market Intelligence", "MeetBarter Intelligence focus: Scarcity, demand, and liquidity.", "🔭", "portal-strategic")}
                    {renderProtocolCard("AUDITOR", "Audit & Transparency", "Transparency focus: Log export and integrity reporting.", "📈", "portal-audit")}
                </div>
            </div>
        );
    }

    if (protocol === "TECHNICAL") {
        return (
            <div className="admin-container">
                {renderPortalHeader("Technical Handover Protocol", "Lead Developer Control System")}
                <section className="admin-section">
                    <h2>❄️ Platform Kill Switch</h2>
                    <div className="admin-grid mb-4">
                        <input type="password" placeholder="Code Alpha" aria-label="Code Alpha" className="admin-input" value={code1} onChange={e => setCode1(e.target.value)} />
                        <input type="password" placeholder="Code Beta" aria-label="Code Beta" className="admin-input" value={code2} onChange={e => setCode2(e.target.value)} />
                        <input type="password" placeholder="Fingerprint" aria-label="Fingerprint" className="admin-input" value={fingerprintCode} onChange={e => setFingerprintCode(e.target.value)} />
                    </div>
                    <button onClick={handleToggleFreeze} className={`admin-button ${frozen ? "bg-green-600" : "bg-red-600"} text-white`}>
                        {frozen ? "DEACTIVATE Freeze" : "ACTIVATE Freeze"}
                    </button>
                    {message && <p className="mt-2 font-bold text-center">{message}</p>}
                </section>
                <section className="admin-section border-red-700 bg-red-50">
                    <h2 className="text-red-800">🔑 Master Key Handover</h2>
                    <div className="admin-grid mb-4">
                        <input type="password" placeholder="New Alpha" aria-label="New Alpha" className="admin-input" value={newAlpha} onChange={e => setNewAlpha(e.target.value)} />
                        <input type="password" placeholder="New Beta" aria-label="New Beta" className="admin-input" value={newBeta} onChange={e => setNewBeta(e.target.value)} />
                        <input type="password" placeholder="New Fingerprint" aria-label="New Fingerprint" className="admin-input" value={newFingerprint} onChange={e => setNewFingerprint(e.target.value)} />
                    </div>
                    <button onClick={handleRotateCodes} className="admin-button bg-red-700 text-white">Rotate Keys</button>
                </section>
                <section className="admin-section">
                    <h2>⚙️ System Configuration</h2>
                    <div className="admin-grid mb-4">
                        <div className="admin-input-group">
                            <label htmlFor="ambassador-threshold">Ambassador Trade Threshold</label>
                            <input
                                id="ambassador-threshold"
                                type="number"
                                className="admin-input"
                                value={config.ambassadorTradeThreshold || 100}
                                onChange={e => setConfig({ ...config, ambassadorTradeThreshold: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="admin-input-group">
                            <label htmlFor="legal-entity-id">Legal Entity ID (NGO/Agricultural)</label>
                            <input
                                id="legal-entity-id"
                                type="text"
                                className="admin-input"
                                value={config.legalEntityId || ""}
                                placeholder="Enter Registration Number"
                                onChange={e => setConfig({ ...config, legalEntityId: e.target.value })}
                            />
                        </div>
                    </div>
                    <button onClick={handleUpdateConfig} className="admin-button admin-button-primary">Update Configuration</button>
                </section>
                <section className="admin-section">
                    <h2>📁 Category Параметры</h2>
                    <table className="admin-table">
                        <thead><tr><th>Name</th><th>Escrow %</th><th>Action</th></tr></thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat.id}>
                                    <td>{cat.name}</td>
                                    <td><input className="admin-input-small" aria-label={`Escrow percentage for ${cat.name}`} value={cat.escrowPercentage} onChange={e => handleUpdateCat(cat.id, "escrowPercentage", e.target.value)} />%</td>
                                    <td><button onClick={() => handleSaveCategory(cat)} className="admin-button-small">Save</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                <section className="admin-section">
                    <h2>💓 Market Pulse</h2>
                    <table className="admin-table">
                        <thead><tr><th>City</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                            {cityPulse.map((p, i) => (
                                <tr key={i}>
                                    <td>{p.city}</td>
                                    <td>{p.isCrisisActive ? "🛑 CRISIS" : "✅ NORMAL"}</td>
                                    <td><button onClick={() => handleToggleCrisis(p.city, p.country, p.isCrisisActive)} className="admin-button-small">Toggle</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        );
    }

    if (protocol === "COMPLIANCE") {
        return (
            <div className="admin-container">
                {renderPortalHeader("Compliance & Verification", "Administrative Architect Workflow")}
                <section className="admin-section">
                    <h2>🏢 Business Verifications</h2>
                    <table className="admin-table">
                        <thead><tr><th>Business</th><th>Action</th></tr></thead>
                        <tbody>
                            {pendingBusinesses.map(biz => (
                                <tr key={biz.id}>
                                    <td>{biz.businessName}</td>
                                    <td><button onClick={() => handleApproveBusiness(biz.id, biz.businessName)} className="admin-button-small">Approve</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <section className="admin-section">
                    <h2>📜 Institutional Licenses (Level 3)</h2>
                    <table className="admin-table">
                        <thead><tr><th>Business</th><th>License Details</th><th>Evidence</th><th>Action</th></tr></thead>
                        <tbody>
                            {pendingLicenses.map(lic => (
                                <tr key={lic.id}>
                                    <td>
                                        <div className="font-bold">{lic.businessName}</div>
                                        <div className="text-xs text-gray-500">{lic.user.fullName}</div>
                                    </td>
                                    <td>
                                        <div className="text-xs">
                                            <div><strong>Reg:</strong> {lic.registrationNumber}</div>
                                            <div><strong>Type:</strong> {lic.permitType}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-xs truncate max-w-[150px]">{lic.evidence}</div>
                                    </td>
                                    <td>
                                        <button onClick={() => handleVerifyLicense(lic.id)} className="admin-button-small bg-green-600 text-white">Verify Level 3</button>
                                    </td>
                                </tr>
                            ))}
                            {pendingLicenses.length === 0 && (
                                <tr><td colSpan={4} className="text-center text-gray-400 italic py-4">No pending licenses</td></tr>
                            )}
                        </tbody>
                    </table>
                </section>

                <section className="admin-section">
                    <h2>💳 Subscription Requests</h2>
                    <table className="admin-table">
                        <thead><tr><th>User</th><th>Plan</th><th>Action</th></tr></thead>
                        <tbody>
                            {pendingSubscriptions.map(sub => (
                                <tr key={sub.id}>
                                    <td>
                                        <div className="font-bold">{sub.user.fullName}</div>
                                        <div className="text-xs text-gray-500">{sub.user.email}</div>
                                    </td>
                                    <td>
                                        <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-800 text-xs font-bold">{sub.tier}</span>
                                        <div className="text-xs text-gray-500 mt-1">${sub.amount} ({sub.currency})</div>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleVerifySubscription(sub.id)}
                                            className="admin-button-small bg-green-600 text-white mr-2"
                                        >
                                            Verify
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm("Reject subscription?")) {
                                                    // Implement reject logic if needed, or just ignore
                                                }
                                            }}
                                            className="admin-button-small bg-red-100 text-red-600 hover:bg-red-200"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {pendingSubscriptions.length === 0 && (
                                <tr><td colSpan={3} className="text-center text-gray-400 italic py-4">No pending subscriptions</td></tr>
                            )}
                        </tbody>
                    </table>
                </section>

                <section className="admin-section">
                    <h2>🧑‍🌾 Community Requests</h2>
                    <table className="admin-table">
                        <thead><tr><th>Name</th><th>Role</th><th>Action</th></tr></thead>
                        <tbody>
                            {pendingCommunity.map(req => (
                                <tr key={req.id}>
                                    <td>{req.fullName}</td>
                                    <td>{req.communityRole}</td>
                                    <td><button onClick={() => handleApproveCommunity(req)} className="admin-button-small">Verify</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                <section className="admin-section">
                    <h2>📦 Export Vault</h2>
                    <button onClick={handleExportVault} className="admin-button bg-slate-700 text-white">Download Encrypted Vault</button>
                </section>
                <section className="admin-section border-indigo-700">
                    <h2 className="text-indigo-800">🤝 Ambassador Applications</h2>
                    <p className="text-[10px] text-gray-400 mb-4 italic">Behavioral Collusion Analysis Enabled.</p>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Collusion Risk</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingAmbassadors.map(amb => (
                                <tr key={amb.id}>
                                    <td>
                                        <div className="font-bold">{amb.fullName}</div>
                                        <div className="text-[10px] text-gray-500">{amb.email}</div>
                                    </td>
                                    <td>
                                        <div className={`text-xs font-bold ${(amb.risk?.maxConcentration || 0) > 0.7 ? 'text-red-600' : 'text-green-600'}`}>
                                            {(amb.risk?.maxConcentration * 100 || 0).toFixed(1)}% Concentration
                                        </div>
                                        <div className="text-[9px] text-gray-400">Top Partner Index: {amb.risk?.topPartner?.slice(0, 8) || 'N/A'}</div>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleApproveAmbassador(amb)}
                                            className="admin-button-small bg-indigo-600 text-white"
                                            disabled={(amb.risk?.maxConcentration || 0) > 0.9}
                                        >
                                            Onboard
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <section className="admin-section section-green border-[#16a34a]">
                    <h2 className="text-[#15803d]">🏢 Verified Business Registry</h2>
                    <p className="text-[10px] text-gray-400 mb-4 italic">Public transparency list for Ambassadors and Users.</p>
                    <div className="space-y-1">
                        {businessRegistry.map(b => (
                            <div key={b.id} className="business-registry-card">
                                <div>
                                    <div className="font-bold text-sm text-gray-800">{b.businessName}</div>
                                    <div className="text-[10px] text-gray-500">{b.fullName} • L{b.verificationLevel} Verified</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-green-600">{b.globalTrustScore}% Trust</div>
                                    <div className="text-[9px] text-gray-400">Onboarded {new Date(b.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        ))}
                        {businessRegistry.length === 0 && <p className="text-center text-gray-400 py-4 italic">No verified businesses currently registered.</p>}
                    </div>
                </section>
            </div>
        );
    }

    if (protocol === "LEGAL") {
        return (
            <div className="admin-container">
                {renderPortalHeader("Dispute Resolution Desk", "Legal & Conflict Protocol")}
                <section className="admin-section">
                    <h2>⚖️ Trade Disputes</h2>
                    {disputedTrades.map(t => (
                        <div key={t.id} className="trade-card p-4 border rounded mb-2">
                            <p><strong>{t.listing.title}</strong> - {t.offerVP} VP</p>
                            <div className="flex gap-2 mt-2">
                                <button onClick={() => handleResolveDispute(t.id, "RELEASE")} className="admin-button-small bg-green-600 text-white">Release</button>
                                <button onClick={() => handleResolveDispute(t.id, "REFUND")} className="admin-button-small bg-red-600 text-white">Refund</button>
                            </div>
                        </div>
                    ))}
                </section>
                <section className="admin-section">
                    <h2>🛡️ Moderation Queue</h2>
                    <table className="admin-table">
                        <thead><tr><th>Item</th><th>Action</th></tr></thead>
                        <tbody>
                            {moderationFlags.map(f => (
                                <tr key={f.id}>
                                    <td>{f.listing.title} ({f.category})</td>
                                    <td>
                                        <button onClick={() => handleFlagAction(f.id, "approve")} className="admin-button-small mr-2">Allow</button>
                                        <button onClick={() => handleFlagAction(f.id, "reject")} className="admin-button-small bg-red-600 text-white">Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div >
        );
    }

    if (protocol === "BOARD") {
        return (
            <div className="admin-container">
                {renderPortalHeader("Disaster Recovery & Board", "Foundation Continuity")}
                <section className="admin-section">
                    <h2>🧬 Succession Protocol (Heirloom)</h2>
                    <p className="text-xs text-gray-500 mb-4 italic">Institutional Continuity: Five-Key survival mechanism. Requires Alpha + Fingerprint to view keys.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {[1, 2, 3, 4, 5].map(nu => (
                            <div key={nu} className="p-3 bg-gray-50 rounded border border-gray-100">
                                <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Heir {nu} Portal</label>
                                <input
                                    className="admin-input mb-2 text-sm"
                                    placeholder={`Full Name of Heir ${nu}`}
                                    value={String(config[`heir${nu}`] || "")}
                                    onChange={e => setConfig({ ...config, [`heir${nu}`]: e.target.value })}
                                />
                                <input
                                    className="admin-input text-sm"
                                    type="password"
                                    placeholder={`Emergency Key ${nu}`}
                                    value={String(config[`heir${nu}Key`] || "")}
                                    onChange={e => setConfig({ ...config, [`heir${nu}Key`]: e.target.value })}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button onClick={fetchHeirConfig} className="admin-button bg-blue-600 text-white flex-1">Reveal Keys</button>
                        <button onClick={handleUpdateConfig} className="admin-button bg-orange-600 text-white flex-1">Update Protocol</button>
                    </div>
                </section>

                <section className="admin-section border-l-4 border-red-600">
                    <h2 className="text-red-700">💀 Disaster Recovery (Protocol 00)</h2>
                    <p className="text-xs text-red-500 italic mb-4 font-medium">ONLY use in case of catastrophic institutional failure or owner passing.</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                        <input className="admin-input-small text-[10px]" placeholder="Death Date" value={deathDate} onChange={e => setDeathDate(e.target.value)} />
                        <input className="admin-input-small text-[10px]" placeholder="Death Place" value={deathPlace} onChange={e => setDeathPlace(e.target.value)} />
                        <input className="admin-input-small text-[10px]" placeholder="Mokhtar Name" value={mokhtarName} onChange={e => setMokhtarName(e.target.value)} />
                        <input className="admin-input-small text-[10px]" placeholder="License #" value={mokhtarLicense} onChange={e => setMokhtarLicense(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-5 gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map(nu => (
                            <input
                                key={nu}
                                type="password"
                                className="admin-input-small text-center"
                                placeholder={`K${nu}`}
                                id={`em-key-${nu}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={async () => {
                            if (!confirm("ACTIVATE SURVIVAL PROTOCOL? IRREVERSIBLE.")) return;
                            const keys = [1, 2, 3, 4, 5].map(nu => (document.getElementById(`em-key-${nu}`) as HTMLInputElement)?.value);
                            try {
                                const res = await fetch(`${API_BASE_URL}/admin/emergency-unlock`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        key1: keys[0], key2: keys[1], key3: keys[2], key4: keys[3], key5: keys[4],
                                        deathDate, deathPlace, mokhtarName, mokhtarLicense
                                    })
                                });
                                const data = await res.json();
                                if (res.ok) {
                                    alert(`AUTHENTICATED. Admin Codes: ALPHA: ${data.alpha}, BETA: ${data.beta}, FINGERPRINT: ${data.fingerprint}`);
                                } else {
                                    alert(data.message);
                                }
                            } catch { alert("Failed to connect to protocol handler."); }
                        }}
                        className="admin-button bg-black text-white w-full py-3 font-bold"
                    >
                        EXECUTE RECOVERY
                    </button>
                </section>
                <section className="admin-section">
                    <h2>🤝 Community Grants</h2>
                    <div className="admin-grid mb-2">
                        <input placeholder="Email" className="admin-input" value={grantEmail} onChange={e => setGrantEmail(e.target.value)} />
                        <input type="number" placeholder="Amount" className="admin-input" value={grantAmount} onChange={e => setGrantAmount(parseInt(e.target.value))} />
                    </div>
                    <textarea placeholder="Reason/Justification" className="admin-input mb-2" value={grantReason} onChange={e => setGrantReason(e.target.value)} />
                    <button onClick={handleGrant} className="admin-button bg-purple-700 text-white">Issue Grant</button>
                </section>
                <section className="admin-section">
                    <h2>🏆 Bounty Review</h2>
                    {submittedBounties.map(b => (
                        <div key={b.id} className="p-2 border mb-2 flex justify-between">
                            <span>{b.title} ({b.rewardVP} VP)</span>
                            <button onClick={() => handleApproveBounty(b.id)} className="admin-button-small bg-green-600 text-white">Pay</button>
                        </div>
                    ))}
                </section>
            </div>
        );
    }

    if (protocol === "STRATEGIC") {
        return (
            <div className="admin-container">
                {renderPortalHeader("MeetBarter Intelligence", "Strategic Institutional Analysis")}

                <div className="admin-notice flex justify-between items-center">
                    <span><strong>MeetBarter Intelligence Engine:</strong> High-fidelity signals for liquidity and trade velocity.</span>
                    <button
                        onClick={async () => {
                            await fetch(`${API_BASE_URL}/admin/intelligence/snapshot`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code1, fingerprintCode }) });
                            fetchIntelligence();
                        }}
                        className="text-xs bg-white text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-50"
                    >
                        Force Market Snapshot
                    </button>
                </div>

                {intelligence?.anomaliesDetected && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm font-bold mb-6 flex items-center gap-3 animate-pulse">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            ALERT: Potential Economic Manipulation Detected
                            <div className="text-[10px] font-normal opacity-70">Significant circular trading patterns identified in the last 30 days.</div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Top Searches */}
                    <section className="admin-section">
                        <h2 className="flex items-center gap-2">🔍 Top Intent Clusters</h2>
                        <div className="space-y-3 mt-4">
                            {intelligence?.topSearches?.map((s, i: number) => {
                                const vector = s.intentVector ? JSON.parse(s.intentVector) : {};
                                const label = Object.keys(vector).join(', ') || 'General Interest';
                                return (
                                    <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                        <span className="font-medium text-gray-700">{label}</span>
                                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">{s._count._all} signals</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Scarcity / Opportunity */}
                    <section className="admin-section section-orange">
                        <h2 className="flex items-center gap-2 text-orange-700">🔥 Opportunity Indices (High Scarcity)</h2>
                        <p className="text-[10px] text-gray-400 mb-4 italic">Demand vs. Supply ratio (100 = Peak Scarcity)</p>
                        <div className="space-y-3">
                            {intelligence?.opportunityCategories?.map((cat: { category: { name: string }, opportunityIndex: number }, i: number) => (
                                <div key={i} className="p-3 bg-orange-50 rounded border border-orange-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-gray-800 text-sm">{cat.category.name}</span>
                                        <span className="text-orange-600 font-black">{cat.opportunityIndex}/100</span>
                                    </div>
                                    <div className="w-full bg-orange-200 h-1.5 rounded-full overflow-hidden">
                                        <svg className="w-full h-full text-orange-600 fill-current">
                                            <rect width={`${cat.opportunityIndex}%`} height="100%" rx="999" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Liquidity Health */}
                    <section className="admin-section section-green">
                        <h2 className="flex items-center gap-2 text-green-700">🌊 Liquidity Health (Conversion)</h2>
                        <p className="text-[10px] text-gray-400 mb-4 italic">Trade completion velocity by category.</p>
                        <div className="space-y-3">
                            {intelligence?.liquidityHealth?.map((cat: { category: { name: string }, tradeVelocity: number }, i: number) => (
                                <div key={i} className="p-3 bg-green-50 rounded border border-green-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-gray-800 text-sm">{cat.category.name}</span>
                                        <span className="text-green-600 font-bold">{(cat.tradeVelocity * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-green-200 h-1.5 rounded-full overflow-hidden">
                                        <svg className="w-full h-full text-green-600 fill-current">
                                            <rect width={`${Math.min(cat.tradeVelocity * 100, 100)}%`} height="100%" rx="999" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Risk Mapping */}
                    <section className="admin-section section-red">
                        <h2 className="flex items-center gap-2 text-red-700">🛡️ Trust Risk Mapping</h2>
                        <table className="admin-table mt-4">
                            <thead><tr><th>User</th><th>Active Protocol</th><th>Risk Score</th><th>Action</th></tr></thead>
                            <tbody>
                                {intelligence?.trustRisk?.map((r: { fullName: string, userId: string, totalTrades: number, riskScore: number }, i: number) => (
                                    <tr key={i}>
                                        <td className="text-sm font-medium">{r.fullName}</td>
                                        <td>{r.totalTrades} Trades</td>
                                        <td><span className={`px-2 py-0.5 rounded text-xs font-bold ${r.riskScore > 70 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{r.riskScore}%</span></td>
                                        <td><button className="admin-button-small bg-slate-800 text-white" onClick={() => handleForensicScan(r.userId)}>Perform Forensic Scan</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* Strategic Governance Controls */}
                    <section className="admin-section section-indigo">
                        <h2 className="flex items-center gap-2 text-indigo-700">🏛️ Strategic Governance Controls</h2>
                        <div className="space-y-4 mt-6">
                            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <h3 className="text-sm font-bold text-indigo-900 mb-1">Supply Gap Mitigation</h3>
                                <p className="text-xs text-indigo-700 mb-3">Detected significant scarcity in categories with high intent signals.</p>
                                <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm" onClick={() => alert("Strategic outreach protocol activated. Verification rewards for high-demand categories increased by 15% for 48 hours.")}>
                                    Activate Bounty Multiplier
                                </button>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <h3 className="text-sm font-bold text-slate-800 mb-1">Economic Pulse Stabilization</h3>
                                <p className="text-xs text-slate-600 mb-3">Monitor VP velocity and prevent stagnation pools.</p>
                                <button className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-bold" onClick={() => alert("Global liquidity check initiated. Idle escrow balances will be re-validated.")}>
                                    Trigger Global Health Check
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                <section className="admin-section bg-slate-900 text-white border-none">
                    <h2 className="text-slate-400 uppercase text-xs tracking-widest mb-6">Ecosystem Intelligence Insights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-4 border border-slate-700 rounded-lg">
                            <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">VP Circulation Velocity</div>
                            <div className="text-2xl font-black text-blue-400">{intelligence?.economicPulse?.velocity || '0.0'}x <span className="text-[10px] text-slate-500 font-normal">/ 30d</span></div>
                        </div>
                        <div className="p-4 border border-slate-700 rounded-lg">
                            <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Recent Trade Volume</div>
                            <div className="text-2xl font-black text-green-400">{intelligence?.economicPulse?.totalVolumeVP?.toLocaleString() || '0'} VP</div>
                        </div>
                        <div className="p-4 border border-slate-700 rounded-lg">
                            <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Total Circulation</div>
                            <div className="text-2xl font-black text-indigo-400">{((intelligence?.economicPulse?.circulationVP ?? 0) / 1000).toFixed(1)}k VP</div>
                        </div>
                        <div className="p-4 border border-slate-700 rounded-lg">
                            <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">System Stagnation</div>
                            <div className="text-2xl font-black text-red-500">{((intelligence?.economicPulse?.velocity ?? 1) < 0.1) ? 'HIGH' : 'LOW'}</div>
                        </div>
                    </div>
                </section>

                {
                    forensicResults && (
                        <section className="admin-section forensic-lab mt-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-slate-800">🔬 Forensic Investigation: {forensicResults.userId}</h2>
                                <button onClick={() => setForensicResults(null)} className="text-xs text-gray-400">Close Scan</button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">Audit Ledger Matches</h3>
                                    <div className="space-y-2">
                                        {forensicResults.auditLogs.map((log, i: number) => (
                                            <div key={i} className="text-[11px] p-2 bg-white border border-gray-100 rounded">
                                                <span className="font-bold text-blue-600">{log.action}</span> - {new Date(log.createdAt).toLocaleString()}
                                                <div className="text-gray-400 italic mt-1 font-mono">{log.ipAddress}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">Recent Trade Behavior</h3>
                                    <div className="space-y-4">
                                        {forensicResults.tradeActivity.map((trade, i: number) => (
                                            <div key={i} className="forensic-activity-card">
                                                <div className="flex justify-between text-xs font-bold mb-2">
                                                    <span>Trade {trade.id.slice(0, 8)}</span>
                                                    <span className="text-blue-600">{trade.status}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-500">
                                                    {trade.operationCosts.length} Security Checkpoints Triggered.
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )
                }
            </div >
        );
    }

    if (protocol === "AUDITOR") {
        return (
            <div className="admin-container">
                {renderPortalHeader("Audit Logs", "Monitoring & Transparency")}
                <div className="admin-section text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">security Audit Logs</h2>
                    <p className="text-gray-500 mb-8">View detailed system logs and security events in the dedicated dashboard.</p>
                    <Link href="/admin/audits" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                        Open Audit Dashboard
                    </Link>
                </div>


                <section className="admin-section border-t-4 border-blue-500">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-blue-700">⚡ Live Performance Stream</h2>
                        <span className="text-xs text-blue-500 font-mono">Real-Time WebSocket Feed</span>
                    </div>
                    <div className="space-y-2">
                        {perfLogs.length === 0 ? (
                            <p className="text-center text-gray-400 py-4 italic">Waiting for system activity...</p>
                        ) : (
                            perfLogs.map((log, i) => (
                                <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100 font-mono text-xs">
                                    <div className="flex gap-2">
                                        <span className={`font-bold ${log.method === 'GET' ? 'text-green-600' : 'text-blue-600'}`}>{log.method}</span>
                                        <span className="text-gray-600">{log.url}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className={`font-bold ${log.duration > 200 ? 'text-red-500' : 'text-green-500'}`}>
                                            {log.duration}ms
                                        </span>
                                        <span className="text-gray-400">{log.timestamp.toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div >
        );
    }

    return null;
}
