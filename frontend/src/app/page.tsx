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
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    const storedUid = localStorage.getItem("meetbarter_uid");
    if (storedUid) {
      setUserId(storedUid);
      fetchUserData(storedUid);
    } else {
      setLoading(false);
    }
    fetch(`${API_BASE_URL}/categories`).then(res => res.json()).then(setCategories);
  }, []);

  const fetchUserData = (uid: string) => {
    fetchActiveTrades(uid);
    fetch(`${API_BASE_URL}/users/me`).then(res => res.json()).then(setUser);
  };

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

  const handlePostRequest = () => {
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
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* QUICK STATS SECTION */}
      <section className="bg-white border-b border-gray-200 py-6 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-4 md:items-start">

            {/* Left Column: Stats & Actions */}
            <div className="flex-1 md:max-w-md flex flex-col gap-4">

              {/* 1. Pure Stats Card (Isolated) */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow">
                {/* Background Decoration */}
                <div className="absolute top-[-20%] right-[-10%] opacity-10 text-9xl font-black select-none pointer-events-none group-hover:scale-110 transition-transform duration-500">
                  VP
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center h-full min-h-[100px] gap-4">
                  {/* Trust Score (Left) */}
                  <div className="flex flex-col gap-1">
                    <div className="text-xs uppercase tracking-wider opacity-80 font-semibold">Trust Score</div>
                    <div className="font-bold text-2xl bg-white/20 px-4 py-1.5 rounded-lg w-fit backdrop-blur-sm border border-white/10 shadow-sm">
                      {user?.globalTrustScore}
                    </div>
                  </div>

                  {/* Credits/VP (Right) */}
                  <div className="text-left md:text-right">
                    <div className="text-xs uppercase tracking-wider opacity-80 font-semibold mb-1">Administrative Credits</div>
                    <div className={`text-4xl font-extrabold tracking-tight filter drop-shadow-sm ${user && user.walletBalance < 100 ? 'text-red-200' : 'text-white'}`}>
                      {user?.walletBalance.toLocaleString()} <span className="text-xl opacity-80 font-normal">VP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Detached Actions (Separate Row) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={() => setIsTierModalOpen(true)} className="flex items-center justify-center gap-2 p-3 bg-white border border-indigo-100 text-indigo-700 rounded-xl font-semibold shadow-sm hover:bg-indigo-50 hover:border-indigo-200 hover:shadow-md transition-all active:scale-95 group">
                  <span className="text-sm">
                    {user && user.verificationLevel >= 3 ? 'Institutional Member' : `Upgrade to Level ${user ? user.verificationLevel + 1 : 1}`}
                  </span>
                </button>
                <div className="flex items-center justify-center p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <span className="text-xs font-bold text-indigo-600">Tier {user?.verificationLevel || 1} Trust</span>
                </div>
              </div>

            </div>

            {/* Ambassador Progress */}
            <div className="flex-1 md:max-w-lg bg-white rounded-xl border border-indigo-100 p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">Ambassador Path</span>
                  {trades.filter((t: any) => t.status === 'COMPLETED').length >= 5 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-200">
                      Verified Trader
                    </span>
                  )}
                </div>
                <span className="text-indigo-600 font-bold text-sm bg-indigo-50 px-2 py-1 rounded">{user?.ambassadorStatus || 'NONE'}</span>
              </div>

              {user?.ambassadorStatus === 'NONE' && (
                <>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(100, (trades.filter((t: any) => t.status === 'COMPLETED').length / 100) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-gray-500 font-medium">{trades.filter((t: any) => t.status === 'COMPLETED').length} / 100 Trades</span>
                    <button
                      onClick={handleApplyAmbassador}
                      disabled={trades.filter((t: any) => t.status === 'COMPLETED').length < 100}
                      className={`text-xs px-3 py-1.5 rounded font-bold transition-all ${trades.filter((t: any) => t.status === 'COMPLETED').length >= 100
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      Apply Now
                    </button>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className={`p-1.5 rounded border text-[10px] ${trades.filter((t: any) => t.status === 'COMPLETED').length >= 5 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-gray-200 text-gray-400'}`}>
                        <div className="font-bold">Consistent</div>
                        <div>5 Trades</div>
                      </div>
                      <div className={`p-1.5 rounded border text-[10px] ${trades.filter((t: any) => t.status === 'COMPLETED').length >= 100 ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-white border-gray-200 text-gray-400'}`}>
                        <div className="font-bold">Ambassador</div>
                        <div>100 Trades</div>
                      </div>
                      <div className="p-1.5 rounded border text-[10px] bg-white border-gray-200 text-gray-400">
                        <div className="font-bold">Legend</div>
                        <div>1k Trades</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {user?.ambassadorStatus === 'PENDING' && <div className="text-orange-600 text-sm font-medium bg-orange-50 p-2 rounded border border-orange-200 text-center mt-2">Application Under Review...</div>}
              {user?.ambassadorStatus === 'ACTIVE' && <div className="text-green-700 text-sm font-medium bg-green-50 p-2 rounded border border-green-200 text-center mt-2">You are a Verified Ambassador!</div>}
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS HERO */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => {
                setNewListing({ ...newListing, listingType: 'OFFER', title: '', description: '', images: [] });
                setIsModalOpen(true);
              }}
              className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-all hover:-translate-y-1 hover:shadow-md border border-blue-100 group"
            >
              <span className="font-semibold">Post Offer</span>
            </button>

            <button
              onClick={() => {
                setNewListing({ ...newListing, listingType: 'REQUEST', title: 'Start a Request', description: 'I am looking for...', images: [] });
                setIsModalOpen(true);
              }}
              className="flex flex-col items-center justify-center p-6 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-all hover:-translate-y-1 hover:shadow-md border border-purple-100 group"
            >
              <span className="font-semibold">Request Item</span>
            </button>

            <Link href="/dashboard" className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-all hover:-translate-y-1 hover:shadow-md border border-gray-200 group">
              <span className="font-semibold">Dashboard</span>
            </Link>

            <Link href="/ambassador" className="flex flex-col items-center justify-center p-6 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition-all hover:-translate-y-1 hover:shadow-md border border-amber-100 group">
              <span className="font-semibold">Ambassadors</span>
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">

        {/* ACTIVE TRADES */}
        {trades.length > 0 && (
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
                        <span className="text-gray-500 font-medium italic bg-gray-100 px-4 py-2 rounded-lg">Waiting for Seller...</span>
                      )}
                      {trade.status === 'COMPLETED' && (
                        <span className="text-green-600 font-bold flex items-center gap-1 bg-white px-4 py-2 rounded-lg border border-green-100 shadow-sm">
                          Trade Secured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TRENDING CATEGORIES */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            Trending Categories
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {categories.slice(0, 2).map((cat: Category) => (
              <div key={cat.id} className="p-6 bg-white rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">

                </div>
                <h3 className="text-xl font-bold text-green-700 mb-2">{cat.name}</h3>
                <p className="text-gray-600 mb-4">{cat.description}</p>
                <div className="inline-block bg-green-50 text-green-700 text-sm font-semibold px-3 py-1 rounded-full border border-green-100">
                  {cat.minVP} - {cat.maxVP} VP
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MARKETPLACE SEARCH & LISTINGS */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Marketplace</h2>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[200px] p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <select
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((item: any) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden flex flex-col h-full">
                  <div className="h-48 bg-gray-100 flex items-center justify-center text-4xl relative">
                    {(() => {
                      try {
                        const parsed = JSON.parse(item.images);
                        return parsed[0] ? (
                          <img src={parsed[0]} alt={item.title} className="w-full h-full object-cover" />
                        ) : '📦';
                      } catch { return '📦'; }
                    })()}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm">
                      {item.priceVP} VP
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1" title={item.title}>{item.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="truncate max-w-[80px]">{item.location || 'Unknown'}</span>
                      </span>
                      {item.condition && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.condition === 'NEW' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                          {item.condition.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">{item.description}</p>
                    <a href={`/listings/${item.id}`} className="block text-center w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-lg text-sm font-bold transition-colors">
                      View Details
                    </a>
                  </div>
                </div>
              ))}
            </div>
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

      </main>

      {/* CREATE LISTING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {newListing.listingType === 'REQUEST' ? 'Post a Request' : 'List a New Item'}
              </h2>
              <form onSubmit={handleCreateListing} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      required
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={newListing.title}
                      onChange={e => setNewListing({ ...newListing, title: e.target.value })}
                      placeholder={newListing.listingType === 'REQUEST' ? "What do you need?" : "What are you listing?"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      required
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={newListing.categoryId}
                      onChange={e => setNewListing({ ...newListing, categoryId: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                    value={newListing.description}
                    onChange={e => setNewListing({ ...newListing, description: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City / Location</label>
                    <input
                      required
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={newListing.location}
                      onChange={e => setNewListing({ ...newListing, location: e.target.value })}
                      placeholder="e.g. Beirut"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      required
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={newListing.country}
                      onChange={e => setNewListing({ ...newListing, country: e.target.value })}
                    >
                      <option value="Lebanon">Lebanon</option>
                      <option value="USA">USA</option>
                      <option value="France">France</option>
                      <option value="UAE">UAE</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value (VP)</label>
                    <input
                      type="number"
                      required
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={newListing.originalPrice}
                      onChange={e => setNewListing({ ...newListing, originalPrice: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <select
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={newListing.condition}
                      onChange={e => setNewListing({ ...newListing, condition: e.target.value })}
                    >
                      <option value="NEW">New (60%)</option>
                      <option value="USED_GOOD">Used - Good (30%)</option>
                      <option value="USED_FAIR">Used - Fair (20%)</option>
                    </select>
                  </div>
                </div>

                {newListing.listingType === 'OFFER' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photos (Max 5)</label>
                    <ImageUpload
                      initialImages={newListing.images}
                      onUpload={(urls) => setNewListing({ ...newListing, images: urls })}
                      maxImages={5}
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition-colors">
                    {newListing.listingType === 'REQUEST' ? 'Post Request' : 'Create Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <VerificationTiersModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        userId={userId || ''}
        currentLevel={user?.verificationLevel || 1}
        onSuccess={() => fetchUserData(userId || '')}
      />


    </div>
  );
}
