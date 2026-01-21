"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SupportPage() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(true);

    if (!showModal) {
        // Confirmation Screen (After Donation Simulation)
        return (
            <div style={{ fontFamily: 'system-ui', maxWidth: 600, margin: '40px auto', padding: 40, textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#1a1a1a' }}>Thank You for Supporting the Community</h1>
                <p style={{ margin: '20px 0', fontSize: '1.1rem', lineHeight: 1.6, color: '#4b5563' }}>
                    Your contribution supports platform infrastructure, moderation, and security.
                </p>
                <div style={{ backgroundColor: '#f3f4f6', padding: 20, borderRadius: 12, margin: '30px 0' }}>
                    <p style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: 5 }}>You have not received Value Points or trading advantages.</p>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Your participation remains equal to all other members.</p>
                </div>

                <div style={{ display: 'inline-block', padding: '5px 15px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: 999, fontSize: '0.9rem', fontWeight: 'bold' }}>
                    🛡️ Community Supporter
                </div>
                <div style={{ marginTop: 10, fontSize: '0.8rem', color: '#9ca3af' }}>(This badge has no impact on trust score, pricing, or trade priority.)</div>

                <button onClick={() => router.push('/')} style={{ marginTop: 40, padding: '10px 20px', border: '1px solid #ccc', borderRadius: 6, background: 'white', cursor: 'pointer' }}>
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: 'system-ui', maxWidth: 600, margin: '40px auto', padding: 20 }}>
            <h1 style={{ fontSize: '1.8rem', color: '#1a1a1a', marginBottom: 20 }}>Support the Continuity of the Platform</h1>

            <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4b5563', marginBottom: 20 }}>
                This platform exists to enable fair, trust-based exchange without money.
                If you believe in this mission, you may choose to support the platform’s operational costs.
            </p>

            <div style={{ borderLeft: '4px solid #3b82f6', paddingLeft: 20, margin: '30px 0' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Support is voluntary.</p>
                <p style={{ margin: 0 }}>Support does not grant Value Points, trading power, or pricing advantage.</p>
            </div>

            <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4b5563', marginBottom: 40 }}>
                Your contribution helps us maintain security, moderation, and long-term availability.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                <button
                    onClick={() => {
                        alert("This would open a Stripe/Payment link. Simulating success...");
                        setShowModal(false);
                    }}
                    style={{ padding: '15px', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: 8, fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Support the Platform
                </button>
                <button
                    onClick={() => router.push('/')}
                    style={{ padding: '15px', backgroundColor: 'transparent', color: '#666', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '1rem', cursor: 'pointer' }}
                >
                    Continue Without Supporting
                </button>
            </div>

            <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #eee', fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center' }}>
                Value Points are not money and cannot be purchased, sold, or exchanged for cash.
            </div>

            {/* FAQ Snippet */}
            <div style={{ marginTop: 40 }}>
                <h3 style={{ fontSize: '1rem', color: '#1f2937' }}>FAQ</h3>
                <div style={{ marginBottom: 15 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#374151' }}>Q: Do donations give me Value Points or better deals?</div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>A: No. Donations never affect Value Points, trust scores, listings, or trade outcomes.</div>
                </div>
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#374151' }}>Q: Why accept donations at all?</div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>A: To keep the platform independent, secure, and accessible without turning Value Points into money.</div>
                </div>
            </div>
        </div>
    );
}
