"use client";

import React, { useState } from 'react';

interface PreTradeChecklistProps {
    onSubmit: (checklist: { timeAgreed: boolean; locationAgreed: boolean; conditionAgreed: boolean }) => void;
    onCancel?: () => void;
}

export default function PreTradeChecklist({ onSubmit, onCancel }: PreTradeChecklistProps) {
    const [checklist, setChecklist] = useState({
        timeAgreed: false,
        locationAgreed: false,
        conditionAgreed: false
    });

    const allChecked = checklist.timeAgreed && checklist.locationAgreed && checklist.conditionAgreed;

    const handleSubmit = () => {
        if (!allChecked) {
            alert('Please confirm all items before proceeding');
            return;
        }
        onSubmit(checklist);
    };

    return (
        <div className="checklist-container">
            <h3>Pre-Trade Confirmation</h3>
            <p className="checklist-description">
                Before finalizing this trade, please confirm the following details have been agreed upon:
            </p>

            <div className="checklist-items">
                <label className={`checklist-item ${checklist.timeAgreed ? 'checked' : ''}`}>
                    <input
                        type="checkbox"
                        checked={checklist.timeAgreed}
                        onChange={(e) => setChecklist({ ...checklist, timeAgreed: e.target.checked })}
                    />
                    <span className="checkmark">✓</span>
                    <div className="item-content">
                        <div className="item-title">Meeting Time Agreed</div>
                        <div className="item-description">Both parties have confirmed the exact date and time for the trade</div>
                    </div>
                </label>

                <label className={`checklist-item ${checklist.locationAgreed ? 'checked' : ''}`}>                    <input
                    type="checkbox"
                    checked={checklist.locationAgreed}
                    onChange={(e) => setChecklist({ ...checklist, locationAgreed: e.target.checked })}
                />
                    <span className="checkmark">✓</span>
                    <div className="item-content">
                        <div className="item-title">Meeting Location Agreed</div>
                        <div className="item-description">A safe, public location has been confirmed by both parties</div>
                    </div>
                </label>

                <label className={`checklist-item ${checklist.conditionAgreed ? 'checked' : ''}`}>
                    <input
                        type="checkbox"
                        checked={checklist.conditionAgreed}
                        onChange={(e) => setChecklist({ ...checklist, conditionAgreed: e.target.checked })}
                    />
                    <span className="checkmark">✓</span>
                    <div className="item-content">
                        <div className="item-title">Item Condition Agreed</div>
                        <div className="item-description">The condition and specifications of the item have been verified</div>
                    </div>
                </label>
            </div>

            <div className="checklist-actions">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn-cancel">
                        Cancel
                    </button>
                )}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!allChecked}
                    className="btn-submit"
                >
                    {allChecked ? 'Confirm & Proceed' : 'Check All Items to Continue'}
                </button>
            </div>

            <style jsx>{`
                .checklist-container {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    max-width: 500px;
                }
                h3 {
                    margin: 0 0 8px 0;
                    font-size: 1.5rem;
                    color: #111827;
                }
                .checklist-description {
                    margin: 0 0 24px 0;
                    color: #6b7280;
                    font-size: 0.9rem;
                }
                .checklist-items {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .checklist-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }
                .checklist-item:hover {
                    border-color: #3b82f6;
                    background: #eff6ff;
                }
                .checklist-item.checked {
                    border-color: #10b981;
                    background: #ecfdf5;
                }
                .checklist-item input[type="checkbox"] {
                    position: absolute;
                    opacity: 0;
                    cursor: pointer;
                }
                .checkmark {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    border: 2px solid #d1d5db;
                    border-radius: 4px;
                    background: white;
                    color: transparent;
                    font-size: 16px;
                    font-weight: bold;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }
                .checklist-item.checked .checkmark {
                    background: #10b981;
                    border-color: #10b981;
                    color: white;
                }
                .item-content {
                    flex: 1;
                }
                .item-title {
                    font-weight: 600;
                    color: #111827;
                    margin-bottom: 4px;
                }
                .item-description {
                    font-size: 0.85rem;
                    color: #6b7280;
                }
                .checklist-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }
                .btn-cancel {
                    padding: 12px 24px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    background: white;
                    color: #374151;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .btn-cancel:hover {
                    background: #f9fafb;
                }
                .btn-submit {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    background: #3b82f6;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .btn-submit:hover:not(:disabled) {
                    background: #2563eb;
                }
                .btn-submit:disabled {
                    background: #d1d5db;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}
