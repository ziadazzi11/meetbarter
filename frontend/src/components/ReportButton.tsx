'use client';

import { useState } from 'react';

interface ReportButtonProps {
    listingId: string;
    onReportSubmitted?: () => void;
}

export default function ReportButton({ listingId, onReportSubmitted }: ReportButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [category, setCategory] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!category || !reason) {
            alert('Please select a category and provide a reason');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/moderation/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId,
                    category,
                    reason,
                }),
            });

            if (response.ok) {
                alert('Report submitted successfully. Our team will review it shortly.');
                setShowModal(false);
                setCategory('');
                setReason('');
                if (onReportSubmitted) onReportSubmitted();
            } else {
                alert('Failed to submit report. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
            >
                🚩 Report Listing
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Report this listing</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Report Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                    aria-label="Report category"
                                >
                                    <option value="">Select a category...</option>
                                    <option value="drugs">Illegal Drugs/Narcotics</option>
                                    <option value="weapons">Weapons/Firearms</option>
                                    <option value="stolen">Stolen Property</option>
                                    <option value="counterfeit">Counterfeit Goods</option>
                                    <option value="adult">Adult Content/Services</option>
                                    <option value="scam">Scam/Fraud</option>
                                    <option value="other">Other Violation</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Reason</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please describe why you're reporting this listing..."
                                    className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
