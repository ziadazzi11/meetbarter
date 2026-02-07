'use client';

import { API_BASE_URL } from '@/config/api';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
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

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    if (!event) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Event not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />

            {/* Hero Section */}
            <div className="bg-emerald-900 text-white pt-32 pb-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {event.imageUrl && (
                            <img src={event.imageUrl} alt={event.title} className="w-full md:w-64 h-64 object-cover rounded-xl shadow-lg" />
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur">
                                    {event.status}
                                </span>
                                <span className="text-emerald-200 text-sm">Organized by {event.organizer.fullName}</span>
                            </div>
                            <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
                            <div className="text-lg text-emerald-100 mb-6 max-w-2xl">{event.description}</div>

                            <div className="flex flex-wrap gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="opacity-70">📍</span>
                                    {event.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="opacity-70">📅</span>
                                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Listings Section */}
            <main className="max-w-5xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Market Stalls ({event.eventListings.length})</h2>
                    {/* Placeholder for "Join Event" button if we implement it here */}
                </div>

                {event.eventListings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No listings yet. Be the first to set up a stall!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {event.eventListings.map(listing => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
