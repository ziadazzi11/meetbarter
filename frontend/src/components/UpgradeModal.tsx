import React from 'react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    currentCount: number;
    limit: number;
}

export default function UpgradeModal({ isOpen, onClose, onUpgrade, currentCount, limit }: UpgradeModalProps) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '30px', borderRadius: '16px', maxWidth: '400px', width: '90%',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🚀</div>
                <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Storage Limit Reached</h2>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>
                    You have used <strong>{currentCount}</strong> of your <strong>{limit}</strong> available slots.
                </p>

                <div style={{ backgroundColor: '#f0f9ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bae6fd' }}>
                    <h3 style={{ margin: '0 0 5px 0', color: '#0369a1', fontSize: '1.1rem' }}>Premium Business Tier</h3>
                    <ul style={{ textAlign: 'left', margin: '10px 0 0 0', paddingLeft: '20px', color: '#0c4a6e', fontSize: '0.9rem' }}>
                        <li>Unlimited Listing Storage</li>
                        <li>Priority Search Placement</li>
                        <li>"Premium" Profile Badge</li>
                    </ul>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                        onClick={onClose}
                        style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'transparent', cursor: 'pointer' }}
                    >
                        Maybe Later
                    </button>
                    <button
                        onClick={onUpgrade}
                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0284c7', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Upgrade Now
                    </button>
                </div>
            </div>
        </div>
    );
}
