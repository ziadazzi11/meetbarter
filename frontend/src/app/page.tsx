/**
 * Copyright (c) 2026 Ziad Azzi. All Rights Reserved.
 */
"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";
import { ListingCard } from "@/components/Listings/ListingCard";
import CreateListingModal from "@/components/Listings/CreateListingModal";
import VerificationTiersModal from "@/components/VerificationTiersModal";
import HeroSplit from "@/components/HeroSplit";
import AppDownloadBanner from "@/components/AppDownloadBanner";
import MapViewer from "@/components/MapViewer/MapViewer";
import RegistrationCTAModal from "@/components/RegistrationCTAModal";
import { useAuth } from "@/context/AuthContext";

interface Category {
  id: string;
  name: string;
  description: string;
  minVP: number;
  maxVP: number;
}

interface User {
  id: string;
  fullName: string;
  walletBalance: number;
  globalTrustScore: number;
  ambassadorStatus: string;
  verificationLevel: number;
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [isRegistrationCTAOpen, setIsRegistrationCTAOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('Lebanon');

  const [newListing] = useState({
    title: '',
    description: '',
    location: '',
    country: 'Lebanon',
    categoryId: '',
    originalPrice: 0,
    listingType: 'OFFER',
    condition: 'USED_GOOD',
    images: [] as string[]
  });

  useEffect(() => {
    if (userId) {
      fetchActiveTrades(userId);
    }
    setLoading(false);

    fetch(`${API_BASE_URL}/listings/categories`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
        else console.error("Categories API returned non-array:", data);
      })
      .catch(err => console.error("Failed to fetch categories:", err));

    // Listen for Bulk Upload trigger from Header
    const handleBulkOpen = () => setIsBulkModalOpen(true);
    window.addEventListener('openBulkUpload', handleBulkOpen);
    return () => window.removeEventListener('openBulkUpload', handleBulkOpen);
  }, [userId]);

  useEffect(() => {
    // Show Registration CTA on load for new unauthenticated users
    if (!authLoading && !user) {
      const hasSeenCTA = localStorage.getItem('meetbarter_onboarded');
      if (!hasSeenCTA) {
        const timer = setTimeout(() => {
          setIsRegistrationCTAOpen(true);
          localStorage.setItem('meetbarter_onboarded', 'true');
        }, 1500); // Slight delay for "wow" effect
        return () => clearTimeout(timer);
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    let url = `${API_BASE_URL}/listings`;
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (searchLocation) params.append('location', searchLocation);
    if (selectedCountry) params.append('country', selectedCountry);

    const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;

    fetch(finalUrl)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setListings(data);
        else setListings([]);
      })
      .catch(err => console.error("Failed to fetch listings:", err));
  }, [searchQuery, searchLocation, selectedCountry]);

  const fetchActiveTrades = async (uid: string) => {
    fetch(`${API_BASE_URL}/trades/active?userId=${uid}`)
      .then(res => res.json())
      .then(setTrades)
      .catch(() => setLoading(false));
  };

  const getTimeRemaining = (expiresAt: string) => {
    if (!expiresAt) return null;
    const end = new Date(expiresAt).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handlePostOffer = () => {
    if (!user) {
      setIsRegistrationCTAOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handlePostRequest = () => {
    if (!user) {
      setIsRegistrationCTAOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <HeroSplit
        onSearch={(q, room) => {
          setSearchQuery(q);
          if (room) setSearchLocation(room);
        }}
        onPostOffer={handlePostOffer}
        onPostRequest={handlePostRequest}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* ACTIVE TRADES (Conditional) */}
        {user && trades.length > 0 && (
          <section className="bg-indigo-600 rounded-3xl p-8 shadow-2xl shadow-indigo-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3 relative">
              <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">🔄</span>
              Active Barter Swaps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
              {trades.map((trade) => (
                <div key={trade.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                      {trade.status}
                    </span>
                    <span className="text-xs text-indigo-100 font-medium">#{trade.id.slice(0, 8)}</span>
                  </div>
                  <h3 className="text-white font-bold mb-2 group-hover:text-indigo-200 transition-colors uppercase tracking-tight line-clamp-1">
                    {trade.listing?.title || "Unknown Item"}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🤝</span>
                      <span className="text-sm text-indigo-100 italic">Offered by {trade.offerer?.fullName.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MARKETPLACE SECTION */}
        <section id="marketplace">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div>
              <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tight mb-2 uppercase">Marketplace</h2>
              <div className="h-1.5 w-24 bg-indigo-600 rounded-full"></div>
            </div>

            <div className="flex bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-main)] shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
              >
                GRID VIEW
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
              >
                MAP VIEW
              </button>
            </div>
          </div>

          {!user ? (
            <div className="glass-card rounded-3xl p-12 text-center border border-indigo-500/30 bg-gradient-to-b from-transparent to-indigo-500/5">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/30">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h2 className="text-3xl font-black text-[var(--text-main)] mb-4 uppercase">Members Only Marketplace</h2>
              <p className="text-lg text-[var(--text-muted)] max-w-xl mx-auto mb-8">
                The MeetBarter Marketplace is exclusive to verifiable members. Join our trust-based community to browse listings, trade assets, and access our secure ecosystem.
              </p>
              <button
                onClick={() => setIsRegistrationCTAOpen(true)}
                className="inline-block px-10 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl shadow-indigo-600/30"
              >
                Join to Explore
              </button>
            </div>
          ) : (
            viewMode === 'map' ? (
              <MapViewer listings={listings} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {listings.map((item: any) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
              </div>
            )
          )}
        </section>

        {/* ALL CATEGORIES */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-main)] mb-6 uppercase">All Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(2).map((cat: Category) => (
              <div key={cat.id} className="p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] hover:border-indigo-300 hover:shadow-md transition-all text-center">
                <h3 className="font-bold text-[var(--text-main)] mb-1">{cat.name}</h3>
                <p className="text-xs text-[var(--text-muted)] mb-2 line-clamp-2">{cat.description}</p>
                <div className="text-xs font-semibold text-indigo-600">
                  {cat.minVP} - {cat.maxVP} VP
                </div>
              </div>
            ))}
          </div>
        </section>

      </main >

      <AppDownloadBanner />

      <CreateListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId || ''}
        categories={categories}
        initialType={newListing.listingType as 'OFFER' | 'REQUEST'}
        onSuccess={() => {
          // Refresh listings
          const params = new URLSearchParams();
          if (searchLocation) params.append('location', searchLocation);
          if (selectedCountry) params.append('country', selectedCountry);
          const url = params.toString() ? `${API_BASE_URL}/listings/search?${params.toString()}` : `${API_BASE_URL}/listings`;
          fetch(url).then(res => res.json()).then(setListings);
        }}
      />

      <VerificationTiersModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        userId={userId || ''}
        currentLevel={user?.verificationLevel || 1}
        onSuccess={() => { }}
      />

      <RegistrationCTAModal
        isOpen={isRegistrationCTAOpen}
        onClose={() => setIsRegistrationCTAOpen(false)}
      />
    </div >
  );
}
