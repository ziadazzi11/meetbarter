'use client';

import { API_BASE_URL } from '@/config/api';
import { useState, useEffect } from 'react';
import { ListingCard } from '@/components/Listings/ListingCard';
import { useParams } from 'next/navigation';

interface Listing {
    id: string;
    title: string;
    description: string;
    priceVP: number;
    images: string;
    location: string;
    condition?: string;
}

interface EventDetail {
    id: string;
    title: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    imageUrl?: string;
    status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
    eventListings: Listing[];
    organizer: { fullName: string };
}

export default function EventDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        const fetchEvent = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/events/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setEvent(data);
                }
            } catch (error) {
                console.error("Failed to fetch event", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl mb-4 animate-pulse"></div>
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500/50">Accessing Event Stream...</div>
        </div>
    );
    if (!event) return (
        <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center">
            <div className="text-4xl mb-4">🚫</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Event Not Found</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-app)] pb-20">

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 px-4 overflow-hidden border-b border-[var(--glass-border)]">
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row gap-12 items-start">
                        {event.imageUrl ? (
                            <img src={event.imageUrl} alt={event.title} className="w-full md:w-80 h-80 object-cover rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 border-4 border-[var(--glass-border)]" />
                        ) : (
                            <div className="w-full md:w-80 h-80 bg-indigo-500/5 rounded-[2.5rem] flex flex-col items-center justify-center text-indigo-200 border-4 border-dashed border-indigo-500/20 shadow-inner">
                                <span className="text-6xl mb-4">🎟️</span>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Reserved Space</span>
                            </div>
                        )}
                        <div className="flex-1 mt-4 md:mt-0">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                                    {event.status}
                                </span>
                                <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Organized by {event.organizer.fullName}</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 text-[var(--text-main)] uppercase tracking-tight">{event.title}</h1>
                            <div className="text-lg md:text-xl text-[var(--text-muted)] mb-10 max-w-2xl font-medium leading-relaxed">{event.description}</div>

                            <div className="flex flex-wrap gap-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">📍</div>
                                    <div className="text-[var(--text-main)] font-black uppercase tracking-widest text-xs">{event.location}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">📅</div>
                                    <div className="text-[var(--text-main)] font-black uppercase tracking-widest text-xs">
                                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-500/5 blur-[120px] -z-10"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-full bg-amber-500/5 blur-[120px] -z-10"></div>
            </div>

            {/* Listings Section */}
            <main className="max-w-6xl mx-auto px-4 py-20">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-tight">Market Stalls</h2>
                        <p className="text-[var(--text-muted)] font-medium text-sm mt-1">{event.eventListings.length} Assets Registered</p>
                    </div>
                    {/* Join Button */}
                    <button className="px-8 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95">
                        Register Stall
                    </button>
                </div>

                {event.eventListings.length === 0 ? (
                    <div className="text-center py-20 bg-[var(--glass-bg)] rounded-[2.5rem] border-2 border-dashed border-[var(--glass-border)] backdrop-blur-sm">
                        <div className="text-5xl mb-6 opacity-30">📦</div>
                        <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-sm">No Assets Yet. Be the first to trade!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {event.eventListings.map(listing => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
