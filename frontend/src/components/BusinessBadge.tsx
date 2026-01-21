import React from 'react';

interface BusinessBadgeProps {
    isBusiness: boolean;
    businessName?: string;
}

export default function BusinessBadge({ isBusiness, businessName }: BusinessBadgeProps) {
    if (!isBusiness) return null;

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', // Corporate Blue gradient
            color: 'white',
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: 600,
            marginLeft: '8px',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
        }} title={`Verified Business: ${businessName || 'Business Account'}`}>
            <span>🏢</span>
            <span>Business</span>
        </span>
    );
}
