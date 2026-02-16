'use client';

import { API_BASE_URL } from '@/config/api';
import { useState, useEffect } from 'react';
import { ListingCard, Listing } from '@/components/Listings/ListingCard';
import { useParams } from 'next/navigation';

interface EventListingResponse {
    id: string;
    title: string;
    description: string;
    priceVP: number;
    images: string;
    location: string;
    condition?: string;
    user?: {
        fullName: string;
        avatarUrl?: string;
        trustScore?: number;
    };
    createdAt?: string;
    type?: 'offer' | 'request';
    category?: string;
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
    eventListings: EventListingResponse[];
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
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl mb-4 animate-pulse"></div>
            <div className="text-[10px] font-black uppercase tracking-widest text-primary/50">Accessing Event Stream...</div>
        </div>
    );
    if (!event) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
            <div className="text-4xl mb-4">🚫</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Event Not Found</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-20">

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 px-4 overflow-hidden border-b border-border/40">
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row gap-12 items-start">
                        {event.imageUrl ? (
                            <img src={event.imageUrl} alt={event.title} className="w-full md:w-80 h-80 object-cover rounded-[2.5rem] shadow-2xl shadow-primary/20 border-4 border-border/40" />
                        ) : (
                            <div className="w-full md:w-80 h-80 bg-primary/5 rounded-[2.5rem] flex flex-col items-center justify-center text-primary/40 border-4 border-dashed border-primary/20 shadow-inner">
                                <span className="text-6xl mb-4">🎟️</span>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Reserved Space</span>
                            </div>
                        )}
                        <div className="flex-1 mt-4 md:mt-0">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                    {event.status}
                                </span>
                                <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">Organized by {event.organizer.fullName}</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 text-foreground uppercase tracking-tight">{event.title}</h1>
                            <div className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl font-medium leading-relaxed">{event.description}</div>

                            <div className="flex flex-wrap gap-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">📍</div>
                                    <div className="text-foreground font-black uppercase tracking-widest text-xs">{event.location}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">📅</div>
                                    <div className="text-foreground font-black uppercase tracking-widest text-xs">
                                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] -z-10"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-full bg-amber-500/5 blur-[120px] -z-10"></div>
            </div>

            {/* Listings Section */}
            <main className="max-w-6xl mx-auto px-4 py-20">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Market Stalls</h2>
                        <p className="text-muted-foreground font-medium text-sm mt-1">{event.eventListings.length} Assets Registered</p>
                    </div>
                    {/* Join Button */}
                    <button className="px-8 py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                        Register Stall
                    </button>
                </div>

                {event.eventListings.length === 0 ? (
                    <div className="text-center py-20 bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-border/40 backdrop-blur-sm">
                        <div className="text-5xl mb-6 opacity-30">📦</div>
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-sm">No Assets Yet. Be the first to trade!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {event.eventListings.map(item => {
                            // Map backend data to ListingCard interface
                            const listing: Listing = {
                                id: item.id,
                                title: item.title,
                                description: item.description,
                                image: item.images ? (item.images.startsWith('[') ? JSON.parse(item.images)[0] : item.images) : '',
                                type: item.type || 'offer',
                                category: item.category || 'General',
                                location: item.location || event.location,
                                valuePoints: item.priceVP,
                                userId: 'unknown', // event listing might not have this, default or optional
                                userName: item.user?.fullName || 'Anonymous',
                                userAvatar: item.user?.avatarUrl,
                                userTrustScore: item.user?.trustScore || 0,
                                createdAt: item.createdAt || new Date().toISOString(),
                                tags: []
                            };
                            return <ListingCard key={listing.id} listing={listing} />;
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
