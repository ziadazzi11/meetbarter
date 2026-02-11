/**
 * Copyright (c) 2026 Ziad Azzi. All Rights Reserved.
 */
"use client";

import { useEffect, useState } from "react";
import VerificationTiersModal from "@/components/VerificationTiersModal";
import ImageUpload from "@/components/ImageUpload";
import Link from "next/link";
import Image from "next/image";
import { API_BASE_URL } from "@/config/api";
import { ListingCard } from "@/components/Listings/ListingCard";
import CreateListingModal from "@/components/Listings/CreateListingModal";
import BulkUploadModal from "@/components/Listings/BulkUploadModal";
import HeroSplit from "@/components/HeroSplit";
import AppDownloadBanner from "@/components/AppDownloadBanner";
import MapViewer from "@/components/MapViewer/MapViewer";

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

import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id; // Legacy compat

  // const [userId, setUserId] = useState<string | null>(null); // Removed local state
  // const [user, setUser] = useState<User | null>(null); // Removed local state
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
  const [selectedCountry, setSelectedCountry] = useState('Lebanon');
  const [newListing, setNewListing] = useState({
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
    // Auth handled by Context now
    if (userId) {
      fetchActiveTrades(userId);
    }
    setLoading(false); // Page loading done, auth loading handled separately

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
  }, []);   // Listen for Bulk Upload trigger from Header




  useEffect(() => {
    let url = `${API_BASE_URL}/listings`;
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery); // Backend now handles keyword search & logging
    if (searchLocation) params.append('location', searchLocation);
    if (selectedCountry) params.append('country', selectedCountry);
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url).then(res => res.json()).then(data => {
      setListings(Array.isArray(data) ? data : []);
    });
  }, [searchLocation, selectedCountry, searchQuery]);

  const fetchActiveTrades = (uid: string) => {
    fetch(`${API_BASE_URL}/trades?userId=${uid}`)
      .then(res => res.json())
      .then(data => {
        setTrades(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  async function handleConfirm(tradeId: string) {
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/trades/${tradeId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId })
      });
      if (res.ok) fetchActiveTrades(userId);
    } catch (e) { console.error(e); }
  }

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();
    if (newListing.images.length > 5) {
      alert("Maximum 5 photos allowed.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newListing,
          sellerId: userId,
          images: JSON.stringify(newListing.images.filter(img => img !== ""))
        })
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Listing Created!");
      setIsModalOpen(false);
      setNewListing({
        title: '',
        description: '',
        location: '',
        country: 'Lebanon',
        categoryId: '',
        originalPrice: 0,
        listingType: 'OFFER',
        condition: 'USED_GOOD',
        images: []
      });
      setSearchQuery('');
      // Refresh listings
      const params = new URLSearchParams();
      if (searchLocation) params.append('location', searchLocation);
      if (selectedCountry) params.append('country', selectedCountry);
      const url = params.toString() ? `${API_BASE_URL}/listings?${params.toString()}` : `${API_BASE_URL}/listings`;
      fetch(url).then(res => res.json()).then(setListings);
    } catch (err: unknown) {
      alert("Error: " + (err as Error).message);
    }
  }

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

  const handleApplyAmbassador = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/apply-ambassador`, {
        method: 'POST'
      });
      if (res.ok) {
        alert("Ambassador Application Submitted! 🚀");
        fetch(`${API_BASE_URL}/users/me`).then(r => r.json()).then(setUser);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to apply.");
      }
    } catch (e) {
      alert("Error applying.");
    }
  };

  const handlePostOffer = () => {
    if (!user) return window.location.href = '/signup';
    setNewListing({ ...newListing, listingType: 'OFFER', title: '', description: '', images: [] });
    setIsModalOpen(true);
  };

  const handlePostRequest = () => {
    if (!user) return window.location.href = '/signup';
    setNewListing({
      ...newListing,
      title: searchQuery || '',
      location: searchLocation || '',
      country: selectedCountry || 'Lebanon',
      description: `I am looking for: ${searchQuery || 'an item'}. Please contact me if you have one available to trade.`
    });
    setIsModalOpen(true);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent font-sans text-[var(--text-main)]">

      {/* 1. HERO SPLIT SECTION (New) */}
      <HeroSplit onPost={handlePostOffer} onRequest={handlePostRequest} isLoggedIn={!!userId} />

      {/* QUICK STATS SECTION */}
      <section className="bg-transparent py-10 px-4 -mt-12 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

            {/* Left Column: Stats Card */}
            <div className="lg:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-32 h-32 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.82v-1.91c-1.84-.44-3.56-1.57-4.46-3.26l2.49-1.04c.54 1.1 1.54 1.91 2.97 2.21v-3.72l-3.39-.83c-2.02-.49-3.46-1.84-3.46-3.66 0-1.74 1.34-3.14 3.34-3.6V3h2.82v1.94c1.47.33 2.87 1.2 3.61 2.54l-2.36 1.18c-.46-.86-1.12-1.42-2.25-1.72v3.4l3.65.89c2.04.49 3.48 1.95 3.48 3.79-.02 2.37-2.01 3.73-4.28 4.14z" /></svg>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-12 relative z-10">
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center w-full px-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 mb-2 block leading-none text-center">Available Capital</span>
                    <div className="text-5xl md:text-6xl font-black tracking-tighter text-[var(--text-main)] text-center">
                      {user?.walletBalance.toLocaleString()} <span className="text-xl font-medium text-[var(--text-muted)] opacity-50">VP</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="bg-white/50 dark:bg-black/20 px-4 py-2 rounded-xl border border-white/50 dark:border-white/5 flex flex-col items-center min-w-[100px]">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block mb-0.5 px-1 leading-none">Trust Score</span>
                      <span className="font-extrabold text-indigo-600 text-center">{user?.globalTrustScore}</span>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 px-4 py-2 rounded-xl border border-white/50 dark:border-white/5 flex flex-col items-center min-w-[100px]">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block mb-0.5 px-1 leading-none">Clearance</span>
                      <span className="font-extrabold text-indigo-600 text-center">Tier {user?.verificationLevel || 1}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-end items-start md:items-end gap-4">
                  <button onClick={() => setIsTierModalOpen(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest leading-none">
                    {user && user.verificationLevel >= 3 ? 'Institutional Access' : 'Upgrade Trust'}
                  </button>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest">Global Status: {user?.ambassadorStatus || 'Standard Account'}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Mini Dashboard */}
            <div className="glass-card rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-[var(--text-main)] uppercase tracking-widest text-sm mb-6 pb-2 border-b border-[var(--glass-border)]">Network Activity</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Active Trades</span>
                    <span className="font-black text-indigo-600">{trades.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Completed</span>
                    <span className="font-black text-emerald-500">{trades.filter((t: any) => t.status === 'COMPLETED').length}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center text-white font-black text-xs">
                    MB
                  </div>
                  <div>
                    <div className="text-xs font-black text-gray-900 dark:text-white uppercase">Personal Rank</div>
                    <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Senior Trader</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS SECTION */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Post Asset', action: handlePostOffer, color: 'indigo' },
              { label: 'Request Item', action: handlePostRequest, color: 'emerald' },
              { label: 'Dashboard', link: '/dashboard', color: 'slate' },
              { label: 'Network', link: '/ambassador', color: 'amber' }
            ].map((btn, i) => (
              btn.link ? (
                <Link key={i} href={btn.link} className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center gap-2 hover:premium-shadow transition-all group overflow-hidden">
                  <span className="font-black uppercase tracking-widest text-xs text-gray-400 group-hover:text-indigo-600 transition-colors">{btn.label}</span>
                </Link>
              ) : (
                <button key={i} onClick={btn.action} className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center gap-2 hover:premium-shadow transition-all group overflow-hidden">
                  <span className="font-black uppercase tracking-widest text-xs text-gray-400 group-hover:text-indigo-600 transition-colors">{btn.label}</span>
                </button>
              )
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      < main className="max-w-6xl mx-auto px-4 py-8 space-y-12" >

        {/* ACTIVE TRADES */}
        {
          trades.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                Active Trades
              </h2>
              <div className="grid gap-4">
                {trades.map((trade: any) => (
                  <div key={trade.id} className={`p-4 rounded-xl border ${trade.status === 'COMPLETED' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} shadow-sm`}>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-gray-900">{trade.listing.title} <span className="text-gray-400 font-normal">|</span> <span className="text-indigo-600">{trade.offerVP} VP</span></h3>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Status:</span> {trade.status === 'LOCKED' ? 'Confirmation Pending' : trade.status} • <span className="font-medium">Seller:</span> {trade.seller.fullName}
                        </div>

                        {trade.status === 'LOCKED' && trade.expiresAt && (
                          <div className="text-xs text-orange-600 font-semibold bg-orange-50 inline-block px-2 py-0.5 rounded border border-orange-100 mt-1">
                            Expires in: {getTimeRemaining(trade.expiresAt)}
                          </div>
                        )}

                        {/* Escrow Badge */}
                        <div className="mt-2">
                          {trade.status === 'COMPLETED' ? (
                            trade.isVerified ? (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-200">Verification Complete</span>
                            ) : (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full border border-yellow-200">Secure Verification</span>
                            )
                          ) : (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full border border-blue-200">Escrow Held: {trade.operationalEscrowVP} VP</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center">
                        {trade.status === 'LOCKED' && !trade.buyerConfirmed && (
                          <button onClick={() => handleConfirm(trade.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-colors w-full md:w-auto">
                            Confirm Receipt
                          </button>
                        )}
                        {trade.status === 'LOCKED' && trade.buyerConfirmed && (
                          <span className="text-indigo-400 font-black italic bg-indigo-500/5 px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest border border-indigo-500/10">Waiting for Seller...</span>
                        )}
                        {trade.status === 'COMPLETED' && (
                          <span className="text-indigo-600 dark:text-indigo-400 font-black flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20 shadow-sm text-[10px] uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                            Trade Secured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        }

        {/* TRENDING CATEGORIES */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            Trending Categories
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {categories.slice(0, 2).map((cat: Category) => (
              <div key={cat.id} className="p-6 bg-[var(--glass-bg)] rounded-3xl border border-[var(--glass-border)] shadow-xl hover:shadow-indigo-500/10 transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <div className="w-24 h-24 bg-indigo-500 rounded-full blur-3xl"></div>
                </div>
                <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wide">{cat.name}</h3>
                <p className="text-[var(--text-muted)] mb-4">{cat.description}</p>
                <div className="inline-block bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-indigo-500/20">
                  {cat.minVP} - {cat.maxVP} VP
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MARKETPLACE SEARCH & LISTINGS */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-main)]">Marketplace</h2>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[200px] p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <select
                aria-label="Select Country"
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
                className="p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="Lebanon">Lebanon</option>
                <option value="USA">USA</option>
                <option value="France">France</option>
                <option value="UAE">UAE</option>
                <option value="Other">Worldwide</option>
              </select>
              <input
                type="text"
                placeholder="City..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="flex-1 min-w-[150px] p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Grid View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Map View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
              </button>
            </div>
          </div>

          {listings.length === 0 && searchQuery ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="text-4xl mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No results for &quot;{searchQuery}&quot;</h3>
              <p className="text-gray-500 mb-6">Can&apos;t find what you&apos;re looking for?</p>
              <button onClick={handlePostRequest} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
                Post a Request
              </button>
            </div>
          )}

          {!user ? (
            <div className="glass-card rounded-3xl p-12 text-center border border-indigo-500/30 bg-gradient-to-b from-transparent to-indigo-500/5">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/30">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h2 className="text-3xl font-black text-[var(--text-main)] mb-4">Members Only Marketplace</h2>
              <p className="text-lg text-[var(--text-muted)] max-w-xl mx-auto mb-8">
                The MeetBarter Marketplace is exclusive to verifiable members. Join our trust-based community to browse listings, trade assets, and access our secure ecosystem.
              </p>
              <Link href="/signup" className="inline-block px-10 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl shadow-indigo-600/30">
                Join to Explore
              </Link>
            </div>
          ) : (
            viewMode === 'map' ? (
              <MapViewer listings={listings} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((item: any) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
              </div>
            )
          )}
        </section>

        {/* ALL CATEGORIES */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(2).map((cat: Category) => (
              <div key={cat.id} className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-center">
                <h3 className="font-bold text-gray-900 mb-1">{cat.name}</h3>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{cat.description}</p>
                <div className="text-xs font-semibold text-indigo-600">
                  {cat.minVP} - {cat.maxVP} VP
                </div>
              </div>
            ))}
          </div>
        </section>

      </main >

      {/* APP DOWNLOAD BANNER (New) */}
      < AppDownloadBanner />

      {/* CREATE LISTING MODAL */}
      < CreateListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)
        }
        userId={userId || ''}
        categories={categories}
        initialType={newListing.listingType as 'OFFER' | 'REQUEST'}
        onSuccess={() => {
          // Refresh listings
          const params = new URLSearchParams();
          if (searchLocation) params.append('location', searchLocation);
          if (selectedCountry) params.append('country', selectedCountry);
          const url = params.toString() ? `${API_BASE_URL}/listings?${params.toString()}` : `${API_BASE_URL}/listings`;
          fetch(url).then(res => res.json()).then(setListings);
        }}
      />

      < VerificationTiersModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        userId={userId || ''}
        currentLevel={user?.verificationLevel || 1}
        onSuccess={() => fetchUserData(userId || '')}
      />


    </div >
  );
}
