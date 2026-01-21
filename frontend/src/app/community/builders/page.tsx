"use client";

import { useState, useEffect } from 'react';

interface Bounty {
    id: string;
    title: string;
    description: string;
    rewardVP: number;
    status: 'OPEN' | 'CLAIMED' | 'SUBMITTED' | 'COMPLETED';
    assignee?: { fullName: string };
    createdAt: string;
}

export default function BuildersPage() {
    const [bounties, setBounties] = useState<Bounty[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null); // Ideally from Auth Context
    const [submissionProof, setSubmissionProof] = useState("");
    const [selectedBountyId, setSelectedBountyId] = useState<string | null>(null);

    // Mock User ID fetch (replace with actual auth)
    useEffect(() => {
        fetch('http://localhost:3001/users/me')
            .then(res => res.json())
            .then(data => setUserId(data.id))
            .catch(() => console.log('Not logged in'));

        fetchBounties();
    }, []);

    const fetchBounties = () => {
        fetch('http://localhost:3001/bounties')
            .then(res => res.json())
            .then(setBounties)
            .finally(() => setLoading(false));
    };

    const handleClaim = async (id: string) => {
        if (!userId) return alert("Please log in first.");
        if (!confirm("Commit to this task?")) return;

        try {
            const res = await fetch(`http://localhost:3001/bounties/${id}/claim`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (res.ok) fetchBounties();
        } catch (err) { alert("Failed to claim"); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:3001/bounties/${selectedBountyId}/submit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ evidence: submissionProof })
            });
            if (res.ok) {
                alert("Work Submitted!");
                setSelectedBountyId(null);
                setSubmissionProof("");
                fetchBounties();
            }
        } catch (err) { alert("Failed to submit"); }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <header style={{ marginBottom: 40, textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#1e293b' }}>🛠️ Builders' Hub</h1>
                <p style={{ color: '#64748b' }}>Earn Value Points by contributing code, design, or audit work.</p>
            </header>

            {loading ? <p>Loading tasks...</p> : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {bounties.map(bounty => (
                        <div key={bounty.id} style={{
                            padding: '24px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            backgroundColor: bounty.status === 'COMPLETED' ? '#f8fafc' : '#fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>{bounty.title}</h3>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        backgroundColor:
                                            bounty.status === 'OPEN' ? '#dcfce7' :
                                                bounty.status === 'CLAIMED' ? '#fef9c3' :
                                                    '#f1f5f9',
                                        color:
                                            bounty.status === 'OPEN' ? '#166534' :
                                                bounty.status === 'CLAIMED' ? '#854d0e' :
                                                    '#475569'
                                    }}>
                                        {bounty.status}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{bounty.rewardVP} VP</div>
                                </div>
                            </div>

                            <p style={{ margin: '16px 0', color: '#475569', lineHeight: 1.6 }}>
                                {bounty.description}
                            </p>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                                    {bounty.assignee ? `Assigned to: ${bounty.assignee.fullName}` : "Unassigned"}
                                </span>

                                {bounty.status === 'OPEN' && (
                                    <button
                                        onClick={() => handleClaim(bounty.id)}
                                        style={{ backgroundColor: '#0f172a', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                                    >
                                        Claim Task
                                    </button>
                                )}

                                {bounty.status === 'CLAIMED' && userId === "CURRENT_USER_ID_CHECK_TODO" && (
                                    <button
                                        onClick={() => setSelectedBountyId(bounty.id)}
                                        style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                                    >
                                        Submit Work
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {bounties.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>
                            No active bounties right now. Check back later!
                        </div>
                    )}
                </div>
            )}

            {/* SUBMISSION MODAL */}
            {selectedBountyId && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: 'white', padding: 30, borderRadius: 12, width: '100%', maxWidth: '500px' }}>
                        <h3>Submit Your Work</h3>
                        <form onSubmit={handleSubmit}>
                            <label style={{ display: 'block', marginBottom: 10, fontSize: '0.9rem' }}>Proof of Work (Link to PR, Doc, etc):</label>
                            <textarea
                                required
                                value={submissionProof}
                                onChange={e => setSubmissionProof(e.target.value)}
                                style={{ width: '100%', padding: 10, borderRadius: 8, borderColor: '#cbd5e1', minHeight: 100, marginBottom: 20 }}
                                placeholder="https://github.com/..."
                            />
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setSelectedBountyId(null)} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: 'transparent' }}>Cancel</button>
                                <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#2563eb', color: 'white' }}>Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
