'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InstitutionalVerificationPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        registrationNumber: '',
        permitType: 'COMMERCIAL',
        issuingAuthority: '',
        evidenceUrl: '', // For now, simple URL. Later, file upload.
        evidencePhotoUrl: '',
        issuedAt: '',
        expiresAt: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/${user.id}/submit-license`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    evidence: {
                        links: [formData.evidenceUrl],
                        photos: [formData.evidencePhotoUrl]
                    }
                })
            });

            if (!res.ok) throw new Error('Failed to submit license');

            alert('License submitted successfully! Our compliance team will review it shortly.');
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Error submitting license. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
                    <p className="mb-4">You need to be logged in to apply for institutional verification.</p>
                    <Link href="/" className="text-blue-600 hover:underline">Go Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="bg-indigo-900 px-6 py-4">
                    <h1 className="text-2xl font-bold text-white">Institutional Verification (Level 3)</h1>
                    <p className="text-indigo-200 text-sm mt-1">Submit your official business license for verification.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Business Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Business Name</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={formData.businessName}
                                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                            />
                        </div>

                        {/* Registration Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Registration / Tax ID</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={formData.registrationNumber}
                                onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                            />
                        </div>

                        {/* Permit Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Permit Type</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={formData.permitType}
                                onChange={e => setFormData({ ...formData, permitType: e.target.value })}
                            >
                                <option value="COMMERCIAL">Commercial Register</option>
                                <option value="INDUSTRIAL">Industrial Permit</option>
                                <option value="NON_PROFIT">Non-Profit / NGO</option>
                                <option value="EDUCATIONAL">Educational License</option>
                            </select>
                        </div>

                        {/* Issuing Authority */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Issuing Authority</label>
                            <input
                                type="text"
                                placeholder="e.g. Ministry of Economy"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={formData.issuingAuthority}
                                onChange={e => setFormData({ ...formData, issuingAuthority: e.target.value })}
                            />
                        </div>

                        {/* Dates */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Issued At</label>
                            <input
                                type="date"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={formData.issuedAt}
                                onChange={e => setFormData({ ...formData, issuedAt: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Expires At</label>
                            <input
                                type="date"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={formData.expiresAt}
                                onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Evidence of Legitimacy</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Document URL (PDF/Image)</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    value={formData.evidenceUrl}
                                    onChange={e => setFormData({ ...formData, evidenceUrl: e.target.value })}
                                />
                                <p className="mt-1 text-xs text-gray-500">Provide a secure link to view your business license.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Photo Evidence (Optional)</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    value={formData.evidencePhotoUrl}
                                    onChange={e => setFormData({ ...formData, evidencePhotoUrl: e.target.value })}
                                />
                                <p className="mt-1 text-xs text-gray-500">Photo of your storefront or office.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end space-x-4">
                        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Submitting...' : 'Submit License'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
