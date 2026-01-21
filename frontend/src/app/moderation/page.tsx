'use client';

import { useEffect, useState } from 'react';

interface ModerationFlag {
    id: string;
    reason: string;
    category: string;
    severity: string;
    matchedKeywords: string;
    createdAt: string;
    listing: {
        id: string;
        title: string;
        description: string;
        seller: {
            id: string;
            email: string;
            fullName: string;
            reportCount: number;
            isBanned: boolean;
        };
    };
    reportedBy?: {
        email: string;
        fullName: string;
    };
}

export default function ModerationPage() {
    const [flags, setFlags] = useState<ModerationFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewNotes, setReviewNotes] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetchFlags();
    }, []);

    const fetchFlags = async () => {
        try {
            const response = await fetch('/api/moderation/flags/pending');
            const data = await response.json();
            setFlags(data);
        } catch (error) {
            console.error('Error fetching flags:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (flagId: string) => {
        const notes = reviewNotes[flagId] || '';
        try {
            await fetch(`/api/moderation/flags/${flagId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes }),
            });
            alert('Listing approved and reactivated');
            fetchFlags();
        } catch (error) {
            console.error('Error approving flag:', error);
            alert('Failed to approve');
        }
    };

    const handleReject = async (flagId: string) => {
        const notes = reviewNotes[flagId] || '';
        try {
            await fetch(`/api/moderation/flags/${flagId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes }),
            });
            alert('Listing rejected, user violation recorded');
            fetchFlags();
        } catch (error) {
            console.error('Error rejecting flag:', error);
            alert('Failed to reject');
        }
    };

    const handleBanUser = async (userId: string, reason: string) => {
        if (!confirm('Are you sure you want to permanently ban this user?')) return;

        try {
            await fetch(`/api/moderation/users/${userId}/ban`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });
            alert('User banned successfully');
            fetchFlags();
        } catch (error) {
            console.error('Error banning user:', error);
            alert('Failed to ban user');
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'auto_reject':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'high_risk':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'medium_risk':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Loading moderation queue...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Content Moderation Queue</h1>
                    <p className="text-gray-600 mt-2">
                        {flags.length} pending review{flags.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {flags.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-500 text-lg">✅ All clear! No pending flags.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {flags.map((flag) => {
                            const keywords = flag.matchedKeywords
                                ? JSON.parse(flag.matchedKeywords)
                                : [];

                            return (
                                <div
                                    key={flag.id}
                                    className={`bg-white rounded-lg shadow-lg border-2 p-6 ${getSeverityColor(
                                        flag.severity
                                    )}`}
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-semibold uppercase tracking-wide">
                                                    {flag.category}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(flag.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <h2 className="text-xl font-bold">{flag.listing.title}</h2>
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border">
                                            {flag.severity.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Listing Details */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded">
                                        <p className="text-sm text-gray-700">
                                            <strong>Description:</strong> {flag.listing.description}
                                        </p>
                                        {keywords.length > 0 && (
                                            <div className="mt-2">
                                                <strong className="text-sm">Matched Keywords:</strong>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {keywords.map((kw: string, idx: number) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-mono"
                                                        >
                                                            {kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Seller Info */}
                                    <div className="mb-4 p-4 border border-gray-200 rounded">
                                        <h3 className="font-semibold mb-2">Seller Information</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-600">Email:</span>{' '}
                                                <span className="font-medium">{flag.listing.seller.email}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Name:</span>{' '}
                                                <span className="font-medium">
                                                    {flag.listing.seller.fullName || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Violations:</span>{' '}
                                                <span
                                                    className={`font-bold ${flag.listing.seller.reportCount >= 2
                                                            ? 'text-red-600'
                                                            : 'text-yellow-600'
                                                        }`}
                                                >
                                                    {flag.listing.seller.reportCount}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Status:</span>{' '}
                                                <span
                                                    className={`font-medium ${flag.listing.seller.isBanned ? 'text-red-600' : 'text-green-600'
                                                        }`}
                                                >
                                                    {flag.listing.seller.isBanned ? 'BANNED' : 'Active'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Report Reason */}
                                    <div className="mb-4">
                                        <strong className="text-sm">Report Reason:</strong>
                                        <p className="text-sm text-gray-700 mt-1">{flag.reason}</p>
                                        {flag.reportedBy && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Reported by: {flag.reportedBy.fullName} ({flag.reportedBy.email})
                                            </p>
                                        )}
                                    </div>

                                    {/* Review Notes */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">Review Notes</label>
                                        <textarea
                                            value={reviewNotes[flag.id] || ''}
                                            onChange={(e) =>
                                                setReviewNotes({ ...reviewNotes, [flag.id]: e.target.value })
                                            }
                                            placeholder="Add notes about your decision..."
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                            rows={2}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 justify-end">
                                        {flag.listing.seller.reportCount >= 2 && (
                                            <button
                                                onClick={() =>
                                                    handleBanUser(
                                                        flag.listing.seller.id,
                                                        `Banned after ${flag.listing.seller.reportCount + 1} violations`
                                                    )
                                                }
                                                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 font-medium"
                                            >
                                                🚫 Ban User
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleApprove(flag.id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                                        >
                                            ✓ Approve Listing
                                        </button>
                                        <button
                                            onClick={() => handleReject(flag.id)}
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                                        >
                                            ✗ Reject Listing
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
