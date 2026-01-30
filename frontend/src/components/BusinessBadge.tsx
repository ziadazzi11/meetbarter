import React from 'react';

interface BusinessBadgeProps {
    isBusiness: boolean;
    businessName?: string;
    verificationLevel?: number; // 1: Comm, 2: Prof, 3: Inst
}

export default function BusinessBadge({ isBusiness, businessName, verificationLevel }: BusinessBadgeProps) {
    if (!isBusiness) return null;

    const isInstitutional = verificationLevel === 3;

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: isInstitutional
                ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' // Darker Institutional Blue
                : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', // Corporate Blue gradient
            color: 'white',
            fontSize: '0.7rem',
            padding: '2px 10px',
            borderRadius: '12px',
            fontWeight: 700,
            marginLeft: '8px',
            boxShadow: isInstitutional
                ? '0 2px 8px rgba(30, 58, 138, 0.4)'
                : '0 2px 4px rgba(37, 99, 235, 0.2)',
            border: isInstitutional ? '1px solid rgba(255, 255, 255, 0.3)' : 'none'
        }} title={isInstitutional ? `Institutional Partner: ${businessName}` : `Verified Business: ${businessName || 'Business Account'}`}>
            <span>{isInstitutional ? '🏛️' : '🏢'}</span>
            <span>{isInstitutional ? 'Institutional Partner' : 'Business'}</span>
        </span>
    );
}
