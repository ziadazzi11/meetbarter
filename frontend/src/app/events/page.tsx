'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';

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
                const res = await fetch(`${API_BASE_URL}/events`);
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
        <div className="min-h-screen bg-[var(--bg-app)] pb-20">
            <main className="max-w-6xl mx-auto px-4 pt-32">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <div className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                            Community Core
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-[var(--text-main)] uppercase tracking-tight">Community Events</h1>
                        <p className="text-[var(--text-muted)] mt-2 font-medium">Join local barter markets and specialized trading events.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl mb-4"></div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500/50">Processing Network Data...</div>
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {events.map(event => (
                            <div
                                key={event.id}
                                onClick={() => router.push(`/events/${event.id}`)}
                                className="group bg-[var(--glass-bg)] rounded-[2rem] border border-[var(--glass-border)] overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm"
                            >
                                <div className="h-56 bg-indigo-500/5 relative overflow-hidden">
                                    {event.imageUrl ? (
                                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-indigo-200">
                                            <span className="text-5xl mb-2">🎟️</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Reserved Space</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                                        {event.status}
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.2em] mb-3">
                                        {new Date(event.startDate).toLocaleDateString()} • {event.location}
                                    </div>
                                    <h3 className="text-xl font-black text-[var(--text-main)] mb-3 uppercase tracking-wide group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                                    <p className="text-[var(--text-muted)] text-sm line-clamp-2 leading-relaxed font-medium">{event.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
