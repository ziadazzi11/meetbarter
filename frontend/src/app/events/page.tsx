'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

interface CommunityEvent {
    id: string;
    title: string;
    description: string;
    location: string;
    startDate: string;
    imageUrl?: string;
    status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
}

export default function EventsPage() {
    const [events, setEvents] = useState<CommunityEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('http://localhost:3000/events');
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data);
                }
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />
            <main className="max-w-4xl mx-auto px-4 pt-24">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Community Events</h1>
                        <p className="text-gray-600 mt-2">Join local barter markets and specialized trading events.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading events...</div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {events.map(event => (
                            <div
                                key={event.id}
                                onClick={() => router.push(`/events/${event.id}`)}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="h-48 bg-gray-200 relative">
                                    {event.imageUrl ? (
                                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                            <span>No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 uppercase">
                                        {event.status}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="text-sm text-emerald-600 font-medium mb-2">
                                        {new Date(event.startDate).toLocaleDateString()} • {event.location}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
