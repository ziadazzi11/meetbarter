"use client";

import React from 'react';

interface TimelineEvent {
    state: string;
    timestamp: string;
}

interface TradeTimelineProps {
    timeline: TimelineEvent[];
    variant?: 'horizontal' | 'vertical';
}

const TIMELINE_STATES = [
    { key: 'AWAITING_FEE', label: 'Fee Pending', icon: '⏳' },
    { key: 'OFFER_MADE', label: 'Offer Sent', icon: '📨' },
    { key: 'OFFER_ACCEPTED', label: 'Accepted', icon: '✅' },
    { key: 'ITEMS_LOCKED', label: 'Items Locked', icon: '🔒' },
    { key: 'TRADE_VERIFIED', label: 'Verified', icon: '✨' },
    { key: 'MEETUP_AGREED', label: 'Meetup Set', icon: '📍' },
    { key: 'TRADE_COMPLETED', label: 'Completed', icon: '🤝' }
];

export default function TradeTimeline({ timeline, variant = 'horizontal' }: TradeTimelineProps) {
    const completedStates = new Set(timeline.map(t => t.state));

    const getCurrentStateIndex = () => {
        for (let i = TIMELINE_STATES.length - 1; i >= 0; i--) {
            if (completedStates.has(TIMELINE_STATES[i].key)) {
                return i;
            }
        }
        return -1;
    };

    const currentIndex = getCurrentStateIndex();

    if (variant === 'vertical') {
        return (
            <div className="timeline-vertical">
                {TIMELINE_STATES.map((state, index) => {
                    const isCompleted = completedStates.has(state.key);
                    const isCurrent = index === currentIndex + 1 && !isCompleted;
                    const event = timeline.find(t => t.state === state.key);

                    return (
                        <div key={state.key} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                            <div className="timeline-marker">
                                <span className="timeline-icon">{state.icon}</span>
                            </div>
                            <div className="timeline-content">
                                <div className="timeline-label">{state.label}</div>
                                {event && (
                                    <div className="timeline-time">
                                        {new Date(event.timestamp).toLocaleDateString()} at{' '}
                                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <style jsx>{`
                    .timeline-vertical {
                        display: flex;
                        flex-direction: column;
                        gap: 24px;
                        position: relative;
                        padding-left: 40px;
                    }
                    .timeline-vertical::before {
                        content: '';
                        position: absolute;
                        left: 18px;
                        top: 0;
                        bottom: 0;
                        width: 2px;
                        background: #e5e7eb;
                    }
                    .timeline-step {
                        display: flex;
                        gap: 16px;
                        align-items: flex-start;
                        position: relative;
                    }
                    .timeline-marker {
                        position: absolute;
                        left: -40px;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: #f3f4f6;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 2px solid #e5e7eb;
                        z-index: 1;
                    }
                    .timeline-step.completed .timeline-marker {
                        background: #10b981;
                        border-color: #059669;
                    }
                    .timeline-step.current .timeline-marker {
                        background: #3b82f6;
                        border-color: #2563eb;
                        animation: pulse 2s infinite;
                    }
                    .timeline-icon {
                        font-size: 18px;
                    }
                    .timeline-content {
                        flex: 1;
                    }
                    .timeline-label {
                        font-weight: 600;
                        color: #374151;
                        margin-bottom: 4px;
                    }
                    .timeline-time {
                        font-size: 0.85rem;
                        color: #6b7280;
                    }
                    @keyframes pulse {
                        0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                        50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                    }
                `}</style>
            </div>
        );
    }

    // Horizontal variant (desktop)
    return (
        <div className="timeline-horizontal">
            {TIMELINE_STATES.map((state, index) => {
                const isCompleted = completedStates.has(state.key);
                const isCurrent = index === currentIndex + 1 && !isCompleted;

                return (
                    <div key={state.key} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                        <div className="timeline-marker">
                            <span className="timeline-icon">{state.icon}</span>
                        </div>
                        <div className="timeline-label">{state.label}</div>
                        {index < TIMELINE_STATES.length - 1 && (
                            <div className={`timeline-connector ${isCompleted ? 'completed' : ''}`} />
                        )}
                    </div>
                );
            })}
            <style jsx>{`
                .timeline-horizontal {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    max-width: 100%;
                    overflow-x: auto;
                    padding: 20px 0;
                }
                .timeline-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex: 1;
                    position: relative;
                    min-width: 100px;
                }
                .timeline-marker {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: #f3f4f6;
                    border: 3px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 12px;
                    transition: all 0.3s ease;
                }
                .timeline-step.completed .timeline-marker {
                    background: #10b981;
                    border-color: #059669;
                }
                .timeline-step.current .timeline-marker {
                    background: #3b82f6;
                    border-color: #2563eb;
                    animation: pulse 2s infinite;
                }
                .timeline-icon {
                    font-size: 22px;
                }
                .timeline-label {
                    font-size: 0.85rem;
                    font-weight: 500;
                    text-align: center;
                    color: #6b7280;
                }
                .timeline-step.completed .timeline-label,
                .timeline-step.current .timeline-label {
                    color: #111827;
                    font-weight: 600;
                }
                .timeline-connector {
                    position: absolute;
                    top: 25px;
                    left: 50%;
                    width: 100%;
                    height: 3px;
                    background: #e5e7eb;
                    z-index: -1;
                }
                .timeline-connector.completed {
                    background: #10b981;
                }
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                    50% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
                }
                @media (max-width: 768px) {
                    .timeline-horizontal {
                        flex-direction: column;
                        align-items: flex-start;
                        padding-left: 40px;
                        position: relative;
                    }
                    .timeline-horizontal::before {
                        content: '';
                        position: absolute;
                        left: 18px;
                        top: 0;
                        bottom: 0;
                        width: 2px;
                        background: #e5e7eb;
                    }
                    .timeline-step {
                        flex-direction: row;
                        gap: 16px;
                        margin-bottom: 24px;
                        min-width: auto;
                    }
                    .timeline-marker {
                        position: absolute;
                        left: -40px;
                        width: 40px;
                        height: 40px;
                    }
                    .timeline-label {
                        text-align: left;
                        margin-top: 8px;
                    }
                    .timeline-connector {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}
