"use client";

import React from 'react';

interface ActivityBadgeProps {
    lastSeenAt?: string;
    averageReplyHours?: number | null;
    variant?: 'inline' | 'block';
}

export default function ActivityBadge({ lastSeenAt, averageReplyHours, variant = 'inline' }: ActivityBadgeProps) {
    const formatLastSeen = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = diff / (1000 * 60 * 60);

        if (hours < 1) return 'Active now';
        if (hours < 24) return 'Today';
        if (hours < 48) return 'Yesterday';

        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;

        return 'Over a month ago';
    };

    const formatReplyTime = (hours: number) => {
        if (hours < 1) return 'within an hour';
        if (hours < 24) return `within ${Math.round(hours)} hours`;
        return `within ${Math.round(hours / 24)} days`;
    };

    if (!lastSeenAt && !averageReplyHours) return null;

    if (variant === 'block') {
        return (
            <div className="activity-badge-block">
                {lastSeenAt && (
                    <div className="activity-item">
                        <span className="activity-icon">🕐</span>
                        <span className="activity-label">Last active:</span>
                        <span className="activity-value">{formatLastSeen(lastSeenAt)}</span>
                    </div>
                )}
                {averageReplyHours && (
                    <div className="activity-item">
                        <span className="activity-icon">💬</span>
                        <span className="activity-label">Usually replies:</span>
                        <span className="activity-value">{formatReplyTime(averageReplyHours)}</span>
                    </div>
                )}
                <style jsx>{`
                    .activity-badge-block {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        padding: 16px;
                        background: #f9fafb;
                        border-radius: 8px;
                        border: 1px solid #e5e7eb;
                    }
                    .activity-item {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 0.9rem;
                    }
                    .activity-icon {
                        font-size: 16px;
                    }
                    .activity-label {
                        color: #6b7280;
                        font-weight: 500;
                    }
                    .activity-value {
                        color: #111827;
                        font-weight: 600;
                    }
                `}</style>
            </div>
        );
    }

    // Inline variant
    return (
        <div className="activity-badge-inline">
            {lastSeenAt && (
                <span className="activity-item">
                    🕐 {formatLastSeen(lastSeenAt)}
                </span>
            )}
            {lastSeenAt && averageReplyHours && <span className="activity-divider">•</span>}
            {averageReplyHours && (
                <span className="activity-item">
                    💬 Replies {formatReplyTime(averageReplyHours)}
                </span>
            )}
            <style jsx>{`
                .activity-badge-inline {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                    color: #6b7280;
                }
                .activity-item {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }
                .activity-divider {
                    color: #d1d5db;
                }
            `}</style>
        </div>
    );
}
