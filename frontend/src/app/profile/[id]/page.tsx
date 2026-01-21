'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
    id: string;
    fullName: string;
    country: string;
    globalTrustScore: number;
    walletBalance: number;
    createdAt: string;
    completedTrades: number;
    activeListing: number;
}

export default function ProfilePage() {
    const params = useParams();
    const userId = params.id as string;
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`/api/users/${userId}/profile`);
            const data = await response.json();
            setProfile(data.profile);
            setListings(data.listings || []);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTrustColor = (score: number) => {
        if (score >= 4.0) return 'text-green-600';
        if (score >= 3.0) return 'text-yellow-600';
        if (score >= 2.0) return 'text-orange-600';
        return 'text-red-600';
    };

    const getTrustLabel = (score: number) => {
        if (score >= 4.0) return 'Excellent';
        if (score >= 3.0) return 'Good';
        if (score >= 2.0) return 'Fair';
        return 'Building Trust';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">User not found</p>
                    <Link href="/" className="text-blue-600 hover:underline">
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {profile.fullName}
                            </h1>
                            <p className="text-gray-600 flex items-center gap-2">
                                <span>📍</span>
                                {profile.country}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Member since {new Date(profile.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Trust Score Badge */}
                        <div className="text-center">
                            <div className={`text-5xl font-bold ${getTrustColor(profile.globalTrustScore)}`}>
                                {profile.globalTrustScore.toFixed(1)}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{getTrustLabel(profile.globalTrustScore)}</p>
                            <p className="text-xs text-gray-500">Trust Score</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {profile.completedTrades}
                            </div>
                            <p className="text-sm text-gray-600">Completed Trades</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {profile.activeListing}
                            </div>
                            <p className="text-sm text-gray-600">Active Listings</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {profile.walletBalance} VP
                            </div>
                            <p className="text-sm text-gray-600">Value Points</p>
                        </div>
                    </div>
                </div>

                {/* Active Listings */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Listings</h2>

                    {listings.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No active listings</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {listings.map((listing) => (
                                <Link
                                    key={listing.id}
                                    href={`/listings/${listing.id}`}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                                >
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        {listing.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                        {listing.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-600 font-bold">{listing.priceVP} VP</span>
                                        <span className="text-xs text-gray-500">{listing.location}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
