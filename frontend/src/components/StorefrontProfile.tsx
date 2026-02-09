import Link from 'next/link';
import Image from 'next/image';

interface Listing {
    id: string;
    title: string;
    description: string;
    priceVP: number;
    location: string;
    images: string; // JSON string
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
}

interface StorefrontProfileProps {
    profile: UserProfile;
    listings: Listing[];
}

export default function StorefrontProfile({ profile, listings }: StorefrontProfileProps) {
    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* 1. Full Width Banner */}
            <div className="relative w-full h-64 md:h-80 bg-gray-900 overflow-hidden">
                {profile.bannerUrl ? (
                    <img src={profile.bannerUrl} alt="Store Banner" className="w-full h-full object-cover opacity-90" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-gray-900 via-gray-800 to-black relative">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-purple-500 to-pink-500"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-white/5 font-black text-6xl uppercase tracking-widest pointer-events-none">
                            Official Store
                        </div>
                    </div>
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>

            {/* 2. Store Header Info (Overlapping) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">

                    {/* Logo/Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-white p-1 shadow-md border border-gray-100 overflow-hidden relative">
                            {profile.profilePicture ? (
                                <img src={profile.profilePicture} alt={profile.fullName} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-4xl font-bold rounded-lg uppercase">
                                    {profile.fullName.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex-grow pt-2">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{profile.fullName}</h1>
                            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                AUTHORIZED PARTNER
                            </span>
                            {profile.verificationLevel >= 4 && (
                                <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                    GOLD TIER
                                </span>
                            )}
                        </div>

                        <p className="text-gray-500 flex items-center gap-2 mb-4 text-sm">
                            <span>📍 {profile.country}</span>
                            <span>•</span>
                            <span>📅 Member since {new Date(profile.createdAt).getFullYear()}</span>
                        </p>

                        <div className="flex flex-wrap gap-4 mt-4">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Trust Score</span>
                                <span className="text-2xl font-bold text-gray-900">{profile.globalTrustScore.toFixed(1)} <span className="text-sm font-normal text-green-600">Excellent</span></span>
                            </div>
                            <div className="w-px h-10 bg-gray-200"></div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Completed Trades</span>
                                <span className="text-2xl font-bold text-gray-900">{profile.completedTrades}</span>
                            </div>
                            <div className="w-px h-10 bg-gray-200"></div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Listings</span>
                                <span className="text-2xl font-bold text-gray-900">{profile.activeListing}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <button className="bg-meetbarter-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                            Chat with Store
                        </button>
                        <button className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2">
                            Share Profile
                        </button>
                    </div>

                </div>
            </div>

            {/* 3. Main Content - Listings Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-meetbarter-neon-blue pl-4">
                        Store Inventory
                    </h2>
                    <div className="text-sm text-gray-500">Showing {listings.length} items</div>
                </div>

                {listings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg">This store has no active listings at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map((listing) => (
                            <Link
                                key={listing.id}
                                href={`/listings/${listing.id}`}
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-meetbarter-neon-blue transition-all duration-300 group"
                            >
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    {/* Image Placeholder logic - parsing JSON if needed, simplistic string check here */}
                                    {listing.images && (
                                        <img
                                            src={listing.images.includes('[') ? JSON.parse(listing.images)[0] : listing.images}
                                            alt={listing.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                                        {listing.priceVP} VP
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">{listing.title}</h3>
                                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        {listing.location}
                                    </p>
                                    <button className="w-full py-2 bg-gray-50 text-gray-700 text-sm font-semibold rounded hover:bg-gray-100 transition-colors border border-gray-100">
                                        View Details
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
