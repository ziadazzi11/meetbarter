'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';

interface OtpRequest {
    id: number;
    phoneNumber: string;
    code: string;
    createdAt: string;
    expiresAt: string;
    user: {
        id: string;
        fullName: string;
        email: string;
        avatarUrl?: string;
    } | null;
}

export default function OtpQueueWidget() {
    const [requests, setRequests] = useState<OtpRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/admin/otp-queue`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setRequests(data as OtpRequest[]);
            }
        } catch (error) {
            console.error('Failed to fetch OTP queue:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const sendWhatsApp = (req: OtpRequest) => {
        const message = `Hello ${req.user?.fullName || 'there'}, your verification code for MeetBarter is: ${req.code}`;
        const url = `https://wa.me/${req.phoneNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    if (loading && requests.length === 0) return <div className="p-4 text-center text-gray-500">Loading requests...</div>;

    if (requests.length === 0) return (
        <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Verification Queue</h3>
            <p className="text-gray-500">No pending verification requests.</p>
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Phone Verification Queue ({requests.length})</h3>
                <button onClick={fetchQueue} className="text-sm text-indigo-600 hover:text-indigo-800">Refresh</button>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {requests.map((req) => (
                    <div key={req.id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{req.user?.fullName || 'Unknown User'}</span>
                                <span className="text-xs text-gray-500">({new Date(req.createdAt).toLocaleTimeString()})</span>
                            </div>
                            <div className="text-sm text-gray-600 font-mono mt-1">
                                {req.phoneNumber}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 px-3 py-1 rounded text-lg font-mono tracking-widest font-bold text-gray-800 border border-gray-300">
                                {req.code}
                            </div>
                            <button
                                onClick={() => sendWhatsApp(req)}
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                title="Send via WhatsApp"
                            >
                                <span>WhatsApp</span>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
