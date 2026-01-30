"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";
import "./city-pulse.css";

const CITIES = ["Beirut", "Jounieh", "Tripoli", "Sidon", "Byblos"];

export default function CityPulse() {
    const [cities, setCities] = useState<string[]>(CITIES);
    const [selectedCity, setSelectedCity] = useState("Beirut");
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = (city: string) => {
        setLoading(true);
        setSelectedCity(city);

        fetch(`${API_BASE_URL}/city-pulse/${city}`)
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        // Fetch stats for selected city
        fetchStats("Beirut");
    }, []);

    return (
        <div className="city-pulse-container">
            <header className="pulse-header">
                <div>
                    <h1>City Pulse ⚡</h1>
                    <p>Real-time trading activity in your area</p>
                </div>
                <div className="city-selector">
                    {cities.map(city => (
                        <button
                            key={city}
                            className={`city-pill ${selectedCity === city ? 'active' : ''}`}
                            onClick={() => fetchStats(city)}
                        >
                            {city}
                        </button>
                    ))}
                </div>
            </header>

            {loading ? (
                <div className="pulse-loading">
                    <div className="spinner"></div>
                    <p>Gathering live data...</p>
                </div>
            ) : (
                <div className="pulse-dashboard">
                    {/* Key Metrics */}
                    <div className="metrics-grid">
                        <div className="metric-card highlight">
                            <span className="icon">🔥</span>
                            <div className="metric-content">
                                <h3>New Today</h3>
                                <div className="value">{stats?.newListingsCount || 0}</div>
                                <span className="label">Fresh Listings</span>
                            </div>
                        </div>

                        <div className="metric-card">
                            <span className="icon">👥</span>
                            <div className="metric-content">
                                <h3>Active Traders</h3>
                                <div className="value">{stats?.activeTradersCount || 0}</div>
                                <span className="label">Last 7 Days</span>
                            </div>
                        </div>

                        <div className="metric-card">
                            <span className="icon">💫</span>
                            <div className="metric-content">
                                <h3>Trade Volume</h3>
                                <div className="value">High</div>
                                <span className="label">Activity Level</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Categories */}
                    <div className="categories-section">
                        <h2>Top Traded Categories (30 Days)</h2>
                        <div className="categories-list">
                            {stats?.topCategories?.map((cat: any, index: number) => (
                                <div key={cat.categoryId} className="category-row">
                                    <div className="rank">#{index + 1}</div>
                                    <div className="cat-name">{cat.categoryName || 'Unknown'}</div>
                                    <div className="cat-count">{cat.count} listings</div>
                                    <div className="cat-bar">
                                        <div
                                            className="fill"
                                            style={{ width: `${(cat.count / (stats.topCategories[0].count || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {(!stats?.topCategories || stats.topCategories.length === 0) && (
                                <div className="empty-state">No category data available yet.</div>
                            )}
                        </div>
                    </div>

                    {/* Live Feed Placeholder */}
                    <div className="live-feed-section">
                        <h2>🔴 Live Activity Feed</h2>
                        <div className="feed-item">
                            <div className="feed-time">Just now</div>
                            <div className="feed-text">Someone listed a <strong>Vintage Camera</strong> in Ashrafieh</div>
                        </div>
                        <div className="feed-item">
                            <div className="feed-time">5m ago</div>
                            <div className="feed-text">Trade completed: <strong>Organic Honey</strong> ↔️ <strong>Guitar Lessons</strong></div>
                        </div>
                        <div className="feed-item">
                            <div className="feed-time">12m ago</div>
                            <div className="feed-text">New Request: <strong>Web Design Services</strong> in Hamra</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
