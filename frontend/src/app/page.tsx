"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Package,
  Search,
  TrendingUp,
  Sparkles,
  Grid3x3,
  Map as MapIcon,
  Filter,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListingCard, Listing } from '@/components/Listings/ListingCard';
import { API_BASE_URL } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import MapViewer from '@/components/MapViewer/MapViewer';

import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Recent trades could also be fetched, but keeping mock for now if no endpoint exists
const recentTrades: { user: string; action: string; time: string; vp: number }[] = [];

export default function HomePage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'offer' | 'request'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await apiClient.fetch(`${API_BASE_URL}/listings`);
        if (res.ok) {
          const data = await res.json();
          // Transform backend data to Listing interface if necessary
          // Assuming backend returns an array of objects matching Listing interface roughly
          const mappedListings = data.map((item: {
            id: string;
            title: string;
            description: string;
            images?: string;
            type?: 'offer' | 'request';
            category?: string;
            location?: string;
            priceVP: number;
            user?: { fullName: string; avatarUrl?: string; trustScore?: number; };
            createdAt: string;
            tags?: string[];
            cashSweetener?: number;
            isFeatured?: boolean;
          }) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            image: item.images ? JSON.parse(item.images)[0] : '', // Handle generic image array
            type: item.type || 'offer', // Default to offer if missing
            category: item.category || 'General',
            location: item.location || 'Online',
            valuePoints: item.priceVP,
            userName: item.user?.fullName || 'Anonymous',
            userAvatar: item.user?.avatarUrl,
            userTrustScore: item.user?.trustScore || 0,
            createdAt: new Date(item.createdAt).toLocaleDateString(),
            tags: item.tags || [],
            cashSweetener: item.cashSweetener,
            isFeatured: item.isFeatured
          }));
          setListings(mappedListings);
        } else {
          console.error("Failed to fetch listings");
          toast.error("Failed to load listings. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
        toast.error("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const filteredListings = listings.filter(listing => {
    const matchesType = filterType === 'all' || listing.type === filterType;
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Split Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

        <div className="container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Community-Driven Trading Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Trade What You Have<br />For What You Need
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Join a trust-based economy where skills, goods, and services are exchanged fairly.
              Build your reputation, help your community, and get what you need.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for items, services, or skills..."
                    className="pl-10 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="lg" className="px-8">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Split CTA Cards - Moved outside user check */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link href={user ? "/listings/create?type=offer" : "/signup"} className="block h-full group">
                  <Card className="h-full border-2 border-green-500/20 hover:border-green-500/40 transition-all hover:shadow-lg hover:shadow-green-500/10 cursor-pointer">
                    <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                      <div>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Package className="h-8 w-8 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">I Have Something</h3>
                        <p className="text-muted-foreground mb-6">
                          Offer your goods, skills, or services to the community
                        </p>
                      </div>
                      <Button asChild className="w-full" size="lg" variant="default">
                        <span>
                          {user ? 'Create Offer' : 'Get Started'}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </span>
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link href={user ? "/listings/create?type=request" : "/signup"} className="block h-full group">
                  <Card className="h-full border-2 border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer">
                    <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                      <div>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Search className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">I Need Something</h3>
                        <p className="text-muted-foreground mb-6">
                          Request items, services, or help from community members
                        </p>
                      </div>
                      <Button asChild className="w-full" size="lg" variant="outline">
                        <span>
                          {user ? 'Create Request' : 'Join Now'}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </span>
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Active Trades Feed & Listings */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Recent Activity Feed */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Live Activity
                  </h3>
                  <div className="space-y-4">
                    {recentTrades.length > 0 ? (
                      recentTrades.map((trade, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-l-2 border-primary/30 pl-3"
                        >
                          <p className="text-sm font-medium">{trade.user}</p>
                          <p className="text-xs text-muted-foreground">{trade.action}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">{trade.time}</span>
                            <Badge variant="secondary" className="text-xs">{trade.vp} VP</Badge>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No recent activity.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Listings Area */}
            <div className="lg:col-span-3">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Marketplace</h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredListings.length} listings available near you
                  </p>
                </div>

                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={(value: 'all' | 'offer' | 'request') => setFilterType(value)}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Listings</SelectItem>
                      <SelectItem value="offer">Offers Only</SelectItem>
                      <SelectItem value="request">Requests Only</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-1 border border-border rounded-lg p-1">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      onClick={() => setViewMode('grid')}
                      className="px-3"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                      onClick={() => setViewMode('map')}
                      className="px-3"
                    >
                      <MapIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Listings Grid */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                  {filteredListings.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      No listings found matching your text.
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[600px] w-full relative z-0">
                  <MapViewer
                    listings={filteredListings.map(l => ({
                      id: l.id,
                      title: l.title,
                      description: l.description,
                      priceVP: l.valuePoints,
                      location: l.location,
                      images: l.image,
                      type: l.type === 'offer' ? 'OFFER' : 'REQUEST'
                    }))}
                    className="h-full border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Only for non-authenticated users */}
      {!user && (
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Trading?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join community members building a better economy together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
