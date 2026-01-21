"use client";

import React from 'react';

interface ExpirationBadgeProps {
    expiresAt: string;
}

export default function ExpirationBadge({ expiresAt }: ExpirationBadgeProps) {
    const getTimeRemaining = () => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) return { expired: true, text: 'Expired' };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 1) {
            return { expired: false, text: `${days} days left`, urgent: false };
        } else if (days === 1) {
            return { expired: false, text: `1 day left`, urgent: false };
        } else if (hours > 1) {
            return { expired: false, text: `${hours} hours left`, urgent: hours < 6 };
        } else {
            return { expired: false, text: 'Less than 1 hour left', urgent: true };
        }
    };

    const { expired, text, urgent } = getTimeRemaining();

    return (
        <div className={`expiration-badge ${expired ? 'expired' : urgent ? 'urgent' : 'normal'}`}>
            <span className="badge-icon">{expired ? '⏰' : '⏳'}</span>
            <span className="badge-text">{text}</span>
            <style jsx>{`
                .expiration-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                .expiration-badge.normal {
                    background: #dbeafe;
                    color: #1e40af;
                }
                .expiration-badge.urgent {
                    background: #fef3c7;
                    color: #92400e;
                    animation: pulse 1.5s infinite;
                }
                .expiration-badge.expired {
                    background: #fee2e2;
                    color: #991b1b;
                }
                .badge-icon {
                    font-size: 14px;
                }
                .badge-text {
                    white-space: nowrap;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}
