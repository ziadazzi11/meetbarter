"use client";

import React from 'react';

interface SoftCommitmentModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    tradeSummary?: {
        itemTitle: string;
        otherParty: string;
        priceVP: number;
    };
}

export default function SoftCommitmentModal({ isOpen, onConfirm, onCancel, tradeSummary }: SoftCommitmentModalProps) {
    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={onCancel} />
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Trade Intent Confirmation</h2>
                    <button className="close-button" onClick={onCancel}>×</button>
                </div>

                <div className="modal-body">
                    {tradeSummary && (
                        <div className="trade-summary">
                            <div className="summary-item">
                                <span className="label">Item:</span>
                                <span className="value">{tradeSummary.itemTitle}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">With:</span>
                                <span className="value">{tradeSummary.otherParty}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Value:</span>
                                <span className="value">{tradeSummary.priceVP} VP</span>
                            </div>
                        </div>
                    )}

                    <div className="intent-message">
                        <p>
                            <strong>Soft Commitment (Non-Binding)</strong>
                        </p>
                        <p>
                            By confirming, you're indicating your intent to complete this trade under the agreed conditions.
                            This is <em>not legally binding</em> but helps build trust and transparency in the community.
                        </p>
                        <p className="note">
                            💡 This commitment will be logged as a trust signal visible to both parties.
                        </p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onCancel}>
                        Not Yet
                    </button>
                    <button className="btn-confirm" onClick={onConfirm}>
                        I Intend to Complete This Trade
                    </button>
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 999;
                }
                .modal-content {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    border-radius: 12px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    z-index: 1000;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                                0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .modal-header {
                    padding: 24px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                    color: #111827;
                }
                .close-button {
                    border: none;
                    background: none;
                    font-size: 2rem;
                    color: #9ca3af;
                    cursor: pointer;
                    line-height: 1;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                }
                .close-button:hover {
                    color: #374151;
                }
                .modal-body {
                    padding: 24px;
                }
                .trade-summary {
                    background: #f9fafb;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 24px;
                }
                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .summary-item:last-child {
                    margin-bottom: 0;
                }
                .summary-item .label {
                    color: #6b7280;
                    font-weight: 500;
                }
                .summary-item .value {
                    color: #111827;
                    font-weight: 600;
                }
                .intent-message p {
                    margin: 0 0 16px 0;
                    color: #374151;
                    line-height: 1.6;
                }
                .intent-message p:last-child {
                    margin-bottom: 0;
                }
                .intent-message strong {
                    color: #111827;
                }
                .note {
                    background: #fef3c7;
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    color: #92400e;
                }
                .modal-footer {
                    padding: 16px 24px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }
                .btn-cancel, .btn-confirm {
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .btn-cancel {
                    border: 1px solid #d1d5db;
                    background: white;
                    color: #374151;
                }
                .btn-cancel:hover {
                    background: #f9fafb;
                }
                .btn-confirm {
                    border: none;
                    background: #3b82f6;
                    color: white;
                }
                .btn-confirm:hover {
                    background: #2563eb;
                }
            `}</style>
        </>
    );
}
