/**
 * Copyright (c) 2026 Ziad Azzi. All Rights Reserved.
 * This software is proprietary and confidential.
 */
"use client";

import { useEffect, useState } from "react";
import "./home.css";
import BusinessVerificationModal from "@/components/BusinessVerificationModal";
import CommunityVerificationModal from "@/components/CommunityVerificationModal";
import LoginModal from "@/components/LoginModal"; // Import

interface Category {
  id: string;
  name: string;
  description: string;
  minVP: number;
  maxVP: number;
}

interface User {
  id: string; // Added ID
  fullName: string;
  walletBalance: number;
  globalTrustScore: number;
  ambassadorStatus: string; // Added for UI
}

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null); // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);

  // ... (Other states)

  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('Lebanon');
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    location: '',
    country: 'Lebanon',
    categoryId: '',
    originalPrice: 0,
    condition: 'USED_GOOD',
    images: [] as string[]
  });

  useEffect(() => {
    // Check Auth
    const storedUid = localStorage.getItem("meetbarter_uid");
    if (storedUid) {
      setUserId(storedUid);
      fetchUserData(storedUid);
    } else {
      setLoading(false); // Stop loading to show login
    }

    fetch("http://localhost:3001/categories").then(res => res.json()).then(setCategories);
  }, []);

  const fetchUserData = (uid: string) => {
    // In a real app we'd use a token, but here we fetch 'me' or just fetch by ID if endpoint allows, 
    // or assuming single user session logic on backend. 
    // Actually /users/me in backend is hardcoded to findFirst(). 
    // We should update fetchActiveTrades to use the UID.

    // Temporary: Use fetch Active Trades with the UID
    fetchActiveTrades(uid);

    // Update User State (Mocking /users/me behavior but with ID)
    // Since /users/me is hardcoded, we might just use the /users/:id endpoint if it existed, 
    // or relying on social login return. 
    // For now, let's assume /users/me returns "someone".
    fetch("http://localhost:3001/users/me").then(res => res.json()).then(setUser);
  };

  // Fetch listings with location and country filter
  useEffect(() => {
    let url = 'http://localhost:3001/listings';
    const params = new URLSearchParams();
    if (searchLocation) params.append('location', searchLocation);
    if (selectedCountry) params.append('country', selectedCountry);

    // If there is a text query, we might want to filter client-side or server-side.
    // For MVP, if backend doesn't support text search, we filter client side.
    // Assuming backend supports basic filters, but let's do client side for "smart search"

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetch(url).then(res => res.json()).then(data => {
      // Client-side filtering for item title if backend doesn't support it yet
      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        const filtered = data.filter((l: any) => l.title.toLowerCase().includes(lower) || l.description.toLowerCase().includes(lower));
        setListings(filtered);
      } else {
        setListings(data);
      }
    });
  }, [searchLocation, selectedCountry, searchQuery]);

  const fetchActiveTrades = (uid: string) => {
    fetch(`http://localhost:3001/trades?userId=${uid}`)
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
      const res = await fetch(`http://localhost:3001/trades/${tradeId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId })
      });
      if (res.ok) {
        // alert("Trade Confirmed!"); // Removed alert to be less intrusive
        fetchActiveTrades(userId);
      }
    } catch (e) { console.error(e); }
  }

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();
    if (newListing.images.length > 3) {
      alert("Maximum 3 photos allowed.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/listings", {
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
        condition: 'USED_GOOD',
        images: []
      });
      setSearchQuery(''); // Clear search on post
      // Refresh listings
      const params = new URLSearchParams();
      if (searchLocation) params.append('location', searchLocation);
      if (selectedCountry) params.append('country', selectedCountry);
      const url = params.toString() ? `http://localhost:3001/listings?${params.toString()}` : 'http://localhost:3001/listings';
      fetch(url).then(res => res.json()).then(setListings);
    } catch (err: unknown) {
      alert("Error: " + (err as Error).message);
    }
  }

  // Helper for parsing expiration
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
      const res = await fetch(`http://localhost:3001/users/${userId}/apply-ambassador`, {
        method: 'POST'
      });
      if (res.ok) {
        alert("Ambassador Application Submitted! 🚀");
        // Reload user
        fetch(`http://localhost:3001/users/me`).then(r => r.json()).then(setUser);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to apply.");
      }
    } catch (e) {
      alert("Error applying.");
    }
  };

  const handlePostRequest = () => {
    // Auto-fill form from search params
    setNewListing({
      ...newListing,
      title: searchQuery || '', // Pre-fill title
      location: searchLocation || '', // Pre-fill location
      country: selectedCountry || 'Lebanon', // Pre-fill country
      description: `I am looking for: ${searchQuery || 'an item'}. Please contact me if you have one available to trade.`
    });
    setIsModalOpen(true);
  };

  if (loading) return <div className="loading-state">Loading Dashboard...</div>;

  return (
    <div className="home-container">
      <header className="dashboard-header">
        <div className="wallet-section">
          <div className="wallet-label">ADMINISTRATIVE CREDITS</div>
          <div className={`wallet-balance ${user && user.walletBalance < 100 ? 'text-red' : 'text-green'}`}>
            {user?.walletBalance.toLocaleString()} VP
          </div>
          <div className="wallet-trust">
            Trust Score: <span className="text-bold">{user?.globalTrustScore}</span>
          </div>
          <button
            onClick={() => setIsBusinessModalOpen(true)}
            style={{ marginTop: '5px', fontSize: '0.75rem', background: 'none', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', color: '#0369a1', marginRight: '5px' }}
          >
            🛡️ Verify Business
          </button>
          <button
            onClick={() => setIsCommunityModalOpen(true)}
            style={{ marginTop: '5px', fontSize: '0.75rem', background: 'none', border: '1px solid #86efac', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', color: '#15803d' }}
          >
            🎖️ Community Role
          </button>
        </div>

        {/* AMBASSADOR PROGRESS */}
        <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded border border-indigo-100 text-xs">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="font-bold text-indigo-900 block text-sm">Ambassador Path</span>
              {trades.filter((t: any) => t.status === 'COMPLETED').length >= 5 && (
                <span className="text-green-600 font-bold text-[10px] bg-green-100 px-1 rounded border border-green-200">
                  ✅ Consistent Trader Verified (5+ Trades)
                </span>
              )}
            </div>
            <span className="text-indigo-600 font-bold">{user?.ambassadorStatus || 'NONE'}</span>
          </div>

          {user?.ambassadorStatus === 'NONE' && (
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2 border border-gray-300">
                <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (trades.filter((t: any) => t.status === 'COMPLETED').length / 100) * 100)}%` }}></div>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600 font-medium">{trades.filter((t: any) => t.status === 'COMPLETED').length} / 100 Trades</span>
                <button
                  onClick={handleApplyAmbassador}
                  disabled={trades.filter((t: any) => t.status === 'COMPLETED').length < 100}
                  className={`px-3 py-1 rounded text-white font-bold transition-colors ${trades.filter((t: any) => t.status === 'COMPLETED').length >= 100 ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md' : 'bg-gray-400 cursor-not-allowed opacity-50'}`}
                >
                  Apply for Ambassador
                </button>
              </div>

              <div className="bg-white p-2 rounded border border-indigo-100 shadow-sm mt-3">
                <strong className="text-indigo-900 block mb-2 text-center text-sm">🏆 The Road to Greatness</strong>

                <div className="space-y-3">
                  {/* Tier 1 */}
                  <div className={`p-2 rounded border ${trades.filter((t: any) => t.status === 'COMPLETED').length >= 5 ? 'bg-green-50 border-green-200 opacity-50' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between font-bold text-xs">
                      <span>✅ Consistent Trader</span>
                      <span>5 Trades</span>
                    </div>
                  </div>

                  {/* Tier 2 */}
                  <div className={`p-2 rounded border relative overflow-hidden ${trades.filter((t: any) => t.status === 'COMPLETED').length >= 100 ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-indigo-200 shadow-sm'}`}>
                    <div className="flex justify-between font-bold text-xs relative z-10">
                      <span className="text-indigo-700">🎖️ Ambassador</span>
                      <span className="text-indigo-600">100 Trades</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 relative z-10">
                      Unlocks: Voting Power, Credibility Badge, Exclusive Trades.
                    </p>
                  </div>

                  {/* Tier 3 */}
                  <div className="p-2 rounded border bg-amber-50 border-amber-200 relative">
                    <div className="flex justify-between font-bold text-xs text-amber-800">
                      <span>👑 Legend / Global Ambassador</span>
                      <span>1000 Trades</span>
                    </div>
                    <p className="text-[10px] text-amber-700 mt-1">
                      The Ultimate Honor. Same benefits as the founders.
                      <br />Warning: Requires 1000 confirmed barters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {user?.ambassadorStatus === 'PENDING' && <div className="text-orange-600 font-bold bg-orange-50 p-2 rounded border border-orange-200">⏳ Application Under Review...</div>}
        {user?.ambassadorStatus === 'ACTIVE' && <div className="text-green-700 font-bold bg-green-50 p-2 rounded border border-green-200">👑 You are a Verified Ambassador!</div>}
      </header>

      <BusinessVerificationModal
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
        userId={userId || ''}
      />

      <CommunityVerificationModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
        userId={userId || ''}
      />

      {/* MY TRADES */}
      {
        trades.length > 0 && (
          <section className="section-container">
            <h2 className="section-title">Active Trades & Operational Escrow</h2>
            <div className="trade-list">
              {trades.map((trade: any) => (
                <div key={trade.id} className="trade-card-user" style={{ backgroundColor: trade.status === 'COMPLETED' ? '#f0fdf4' : '#ffffff' }}>
                  <div>
                    <div className="trade-info-main">{trade.listing.title} - {trade.offerVP} VP</div>
                    <div className="trade-info-sub">
                      Status: {trade.status === 'LOCKED' ? 'Confirmation Pending' : trade.status} | Seller: {trade.seller.fullName}
                    </div>

                    {/* Phase 3: Expiration Timer */}
                    {trade.status === 'LOCKED' && trade.expiresAt && (
                      <div className="trade-expiration">
                        Expires in: {getTimeRemaining(trade.expiresAt)}
                      </div>
                    )}

                    {/* Operational Escrow Notice */}
                    <div className={`trade-status-badge ${trade.isVerified ? 'status-verified' : 'status-pending'}`}>
                      {trade.status === 'COMPLETED' ? (
                        trade.isVerified ? (
                          <>✅ Verification Complete | Unused Escrow Refunded</>
                        ) : (
                          <>⏳ Secure Awaiting Operational Verification</>
                        )
                      ) : (
                        <>⚖️ Operational Escrow Held: {trade.operationalEscrowVP} VP</>
                      )}
                    </div>

                    {trade.isVerified && (trade.operationalEscrowVP > 0) && (
                      <div className="trade-refund-note">
                        * Status: Unused administrative credits returned to wallet.
                      </div>
                    )}

                    {/* Phase 3: Contact Info Reveal */}
                    {trade.status === 'LOCKED' && trade.seller.phoneNumber && (
                      <div className="trade-contact-reveal">
                        📞 Seller Contact: <strong>{trade.seller.phoneNumber}</strong>
                      </div>
                    )}
                  </div>

                  <div className="trade-actions">
                    {trade.status === 'LOCKED' && !trade.buyerConfirmed && (
                      <button onClick={() => handleConfirm(trade.id)} className="btn-primary">
                        Confirm Receipt
                      </button>
                    )}
                    {trade.status === 'LOCKED' && trade.buyerConfirmed && (
                      <span className="trade-waiting-text">Waiting for Seller...</span>
                    )}
                    {trade.status === 'COMPLETED' && (
                      <span className="trade-waiting-text">Trade Secured</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      }

      {/* Trending Categories Section */}
      <section className="section-container">
        <h2 className="section-title">🔥 Trending Categories</h2>
        <div className="category-grid" style={{ marginBottom: '2rem' }}>
          {categories.slice(0, 2).map((cat: Category) => (
            <div key={cat.id} className="category-card" style={{ borderColor: '#22c55e', backgroundColor: '#f0fdf4' }}>
              <h3 style={{ color: '#15803d' }}>{cat.name}</h3>
              <p className="category-description">{cat.description}</p>
              <div className="category-range">{cat.minVP} - {cat.maxVP} VP</div>
            </div>
          ))}
        </div>
      </section>

      {/* Available Listings & Location Search */}
      <section className="section-container">
        <div className="marketplace-header">
          <h2>Marketplace</h2>
          <div className="marketplace-actions">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-success"
            >
              + List an Item
            </button>
            <input
              type="text"
              title="Search Items"
              placeholder="🔍 Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ minWidth: '200px' }}
            />
            <select
              title="Select Country"
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="form-input"
              style={{ minWidth: '150px' }}
            >
              <option value="Lebanon">🇱🇧 Lebanon</option>
              <option value="USA">🇺🇸 USA</option>
              <option value="France">🇫🇷 France</option>
              <option value="UAE">🇦🇪 UAE</option>
              <option value="Other">🌍 Worldwide</option>
            </select>
            <input
              type="text"
              title="Filter by City/Location"
              placeholder="🏙️ Filter by City"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="form-input flex-1"
            />
          </div>
        </div>

        {listings.length === 0 && searchQuery ? (
          <div className="no-results-card" style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🤷‍♂️</div>
            <h3 style={{ color: '#334155', marginBottom: '10px' }}>No results found for "{searchQuery}"</h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Can't find what you're looking for?</p>
            <button onClick={handlePostRequest} className="btn-primary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
              📝 Post a Request for "{searchQuery}"
            </button>
          </div>
        ) : (
          <div className="listing-grid">
            {listings.map((item: any) => (
              <div key={item.id} className="listing-card">
                <div className="listing-image-placeholder">
                  {(() => {
                    try { return JSON.parse(item.images)[0] || '📦'; }
                    catch { return '📦'; }
                  })()}
                </div>
                <div className="listing-details">
                  <div className="listing-header">
                    <h3>{item.title}</h3>
                    <div className="listing-price-tag">
                      <div className="listing-price">{item.priceVP} VP</div>
                      {item.originalPrice && (
                        <div className="listing-original-price">
                          {item.originalPrice} VP
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="badge-group">
                    <span className="badge badge-location">📍 {item.location || 'Unknown'}</span>
                    {item.condition && (
                      <span className={`badge ${item.condition === 'NEW' ? 'badge-new' : 'badge-used'}`}>
                        ✨ {item.condition.replace('_', ' ')}
                      </span>
                    )}
                    {item.originalPrice && (
                      <span className="badge badge-ai">
                        🤖 AI Priced
                      </span>
                    )}
                  </div>
                  <p className="listing-card-desc">{item.description}</p>
                  <a href={`/listings/${item.id}`} className="listing-card-button">
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Categories Grid (Others) */}
      <section className="section-container">
        <h2 className="section-title">All Categories</h2>
        <div className="category-grid">
          {categories.slice(2).map((cat: Category) => (
            <div key={cat.id} className="category-card">
              <h3>{cat.name}</h3>
              <p className="category-description">{cat.description}</p>
              <div className="category-range">{cat.minVP} - {cat.maxVP} VP</div>
            </div>
          ))}
        </div>
      </section>

      {/* CREATE LISTING MODAL */}
      {
        isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">List a New Item</h2>
              <form onSubmit={handleCreateListing} className="form-group">
                <div>
                  <label className="input-label" htmlFor="title">Title</label>
                  <input id="title" title="Title" required className="form-input" value={newListing.title} onChange={e => setNewListing({ ...newListing, title: e.target.value })} />
                </div>
                <div>
                  <label className="input-label" htmlFor="description">Description (or Request Details)</label>
                  <textarea id="description" title="Description" required className="form-input form-textarea" value={newListing.description} onChange={e => setNewListing({ ...newListing, description: e.target.value })} />
                </div>
                <div className="form-row">
                  <div>
                    <label className="input-label" htmlFor="country">Country</label>
                    <select id="country" title="Country" required className="form-input" value={newListing.country} onChange={e => setNewListing({ ...newListing, country: e.target.value })}>
                      <option value="Lebanon">Lebanon</option>
                      <option value="USA">USA</option>
                      <option value="France">France</option>
                      <option value="UAE">UAE</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label" htmlFor="location">City</label>
                    <input id="location" title="City" required className="form-input" value={newListing.location} onChange={e => setNewListing({ ...newListing, location: e.target.value })} placeholder="e.g. Beirut" />
                  </div>
                </div>
                <div>
                  <label className="input-label" htmlFor="category">Category</label>
                  <select id="category" title="Category" required className="form-input" value={newListing.categoryId} onChange={e => setNewListing({ ...newListing, categoryId: e.target.value })}>
                    <option value="">Select Category</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-row">
                  <div>
                    <label className="input-label" htmlFor="price">Original Price (VP)</label>
                    <input id="price" title="Original Price" type="number" required className="form-input" value={newListing.originalPrice} onChange={e => setNewListing({ ...newListing, originalPrice: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="input-label" htmlFor="condition">Condition</label>
                    <select id="condition" title="Condition" className="form-input" value={newListing.condition} onChange={e => setNewListing({ ...newListing, condition: e.target.value })}>
                      <option value="NEW">New (60%)</option>
                      <option value="USED_GOOD">Used - Good (30%)</option>
                      <option value="USED_FAIR">Used - Fair (20%)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="input-label">Photo URLs (Max 3)</label>
                  {newListing.images.map((img: string, idx: number) => (
                    <div key={idx} className="form-photo-row">
                      <input title={`Photo URL ${idx + 1}`} className="form-input flex-1" value={img} onChange={e => {
                        const imgs = [...newListing.images];
                        imgs[idx] = e.target.value;
                        setNewListing({ ...newListing, images: imgs });
                      }} />
                      <button type="button" aria-label="Remove photo" onClick={() => {
                        const imgs = newListing.images.filter((_: any, i: number) => i !== idx);
                        setNewListing({ ...newListing, images: imgs });
                      }} className="btn-remove-photo">×</button>
                    </div>
                  ))}
                  {newListing.images.length < 3 && (
                    <button type="button" onClick={() => setNewListing({ ...newListing, images: [...newListing.images, ''] })} className="btn-add-photo">
                      + Add Photo URL
                    </button>
                  )}
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Create Listing/Request</button>
                </div>
              </form>
            </div>
          </div >
        )
      }

      <footer className="home-footer">
        <div style={{ marginBottom: '20px', color: '#6b7280', fontSize: '0.85rem', maxWidth: '600px', margin: '0 auto 20px' }}>
          <em>The platform may allocate a portion of its net administrative surplus, at its discretion, to community initiatives.</em>
        </div>

        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', display: 'inline-block' }}>
          <a
            href="https://wa.me/96171023083?text=I%20would%20like%20to%20contribute%20to%20keep%20the%20app%20running"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#25D366',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: 'bold',
              marginBottom: '10px'
            }}
          >
            <span>☕ Buy the App a Coffee</span>
          </a>
          <div style={{ marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h4 className="font-bold mb-4">Meetbarter</h4>
              <p className="text-sm text-gray-500">
                © 2026 Meetbarter. All rights reserved. <br />
                Registered in Lebanon (Ministry of Economy).
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
}
