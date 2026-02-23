'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UserIdentityBadge } from '@/components/UserIdentityBadge';

import StorefrontProfile from '@/components/StorefrontProfile';

interface UserAchievement {
    achievement: {
        title: string;
        description: string;
        iconUrl: string;
        rewardVP: number;
    };
}

interface UserProfile {
    id: string;
    fullName: string;
    country: string;
    globalTrustScore: number;
    walletBalance: number;
    createdAt: string;
    completedTrades: number;
    activeListing: number;
    phoneNumber?: string;
    phoneVerified: boolean;
    verificationLevel: number;
    bannerUrl?: string;
    profilePicture?: string;
    ambassadorStatus?: string;
    isRestricted?: boolean;
    message?: string;
    userAchievements?: UserAchievement[];
    idCardStatus?: string | null;
}

import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { PhoneVerificationModal } from '@/components/PhoneVerificationModal';

export default function ProfilePage() {
    const params = useParams();
    const userId = params.id as string;
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

    const fetchProfile = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : {}
            });
            const data = await response.json();
            setProfile(data.profile);
            setListings(data.listings || []);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Unused helpers removed to fix lint

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

    if (profile.isRestricted) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-6">
                        <div className="bg-slate-900 text-white p-6 text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                                <span className="text-2xl">🔒</span>
                            </div>
                            <h1 className="text-xl font-bold mb-1">Privacy Mode Active</h1>
                            <p className="text-sm text-slate-400">Contact information is hidden after trade finalization.</p>
                        </div>

                        <div className="p-8">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">MEMBER REPUTATION</div>
                            <UserIdentityBadge
                                user={{
                                    id: profile.id,
                                    fullName: profile.fullName,
                                    globalTrustScore: profile.globalTrustScore,
                                    completedTrades: profile.completedTrades,
                                    country: profile.country,
                                    userAchievements: profile.userAchievements,
                                    isRestricted: true
                                }}
                                size="lg"
                            />

                            <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-sm text-indigo-700 leading-relaxed">
                                <p>
                                    <strong>Why is this hidden?</strong> To protect our community, we restrict direct access between traders once their transaction is successfully finalized. Trust metrics remain public for historical transparency.
                                </p>
                            </div>

                            <Link href="/dashboard" className="block mt-8">
                                <button className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-bold hover:bg-slate-800 transition active:scale-[0.98]">
                                    Return to Dashboard
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // CONDITIONAL RENDERING: Check for Institutional Verification Level (>= 3)
    if (profile.verificationLevel >= 3) {
        return <StorefrontProfile profile={profile} listings={listings} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="mb-6">
                    <UserIdentityBadge
                        user={{
                            id: profile.id,
                            fullName: profile.fullName,
                            globalTrustScore: profile.globalTrustScore,
                            completedTrades: profile.completedTrades,
                            country: profile.country,
                            idCardStatus: profile.idCardStatus,
                            userAchievements: profile.userAchievements,
                            verificationLevel: profile.verificationLevel
                        }}
                        size="lg"
                    />

                    {user?.id === userId && !profile.phoneVerified && (
                        <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between">
                            <span className="text-sm text-indigo-700">Your phone number is not yet verified.</span>
                            <button
                                onClick={() => setIsPhoneModalOpen(true)}
                                className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition"
                            >
                                Verify Now
                            </button>
                        </div>
                    )}

                    <PhoneVerificationModal
                        isOpen={isPhoneModalOpen}
                        onClose={() => setIsPhoneModalOpen(false)}
                        userId={userId}
                        currentPhoneNumber={profile.phoneNumber}
                        onVerified={() => {
                            fetchProfile(); // Refresh to show verified status
                        }}
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                            {profile.completedTrades}
                        </div>
                        <p className="text-sm text-gray-600">Total Trades</p>
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

                {/* Achievements (NEW) */}
                {profile.userAchievements && profile.userAchievements.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-yellow-500">🏆</span> Achievements
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {profile.userAchievements.map((ua, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2"
                                    title={ua.achievement.description}
                                >
                                    <span className="text-xl">{ua.achievement.iconUrl || '🎖️'}</span>
                                    <span className="text-sm font-semibold text-blue-800">{ua.achievement.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
    );
}
