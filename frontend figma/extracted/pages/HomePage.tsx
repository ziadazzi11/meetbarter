import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Package, 
  Search, 
  MapPin, 
  TrendingUp, 
  Users, 
  Shield,
  Sparkles,
  Grid3x3,
  Map as MapIcon,
  Filter
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ListingCard, Listing } from '../components/Listings/ListingCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

// Mock data
const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Vintage Film Camera - Perfect Condition',
    description: 'Offering my beloved Canon AE-1 with 50mm lens. Works perfectly, includes case.',
    image: 'https://images.unsplash.com/photo-1588420635201-3a9e2a2a0a07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    type: 'offer',
    category: 'Electronics',
    location: 'Brooklyn, NY',
    distance: '2.3 mi',
    valuePoints: 450,
    userId: '1',
    userName: 'Sarah Chen',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    userTrustScore: 95,
    createdAt: '2h ago',
    isFeatured: true,
    tags: ['camera', 'vintage', 'photography']
  },
  {
    id: '2',
    title: 'Custom Wooden Desk - Handmade',
    description: 'Beautiful handcrafted oak desk, perfect for home office. Can deliver locally.',
    image: 'https://images.unsplash.com/photo-1584114238561-e7417aa7bb11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    type: 'offer',
    category: 'Furniture',
    location: 'Queens, NY',
    distance: '5.1 mi',
    valuePoints: 850,
    cashSweetener: 100,
    userId: '2',
    userName: 'Mike Torres',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    userTrustScore: 88,
    createdAt: '5h ago',
    tags: ['furniture', 'handmade', 'wood']
  },
  {
    id: '3',
    title: 'Need: Logo Design Services',
    description: 'Looking for a talented designer to create a logo for my new business.',
    image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    type: 'request',
    category: 'Services',
    location: 'Manhattan, NY',
    distance: '1.8 mi',
    valuePoints: 300,
    userId: '3',
    userName: 'Jordan Lee',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    userTrustScore: 92,
    createdAt: '1d ago',
    tags: ['design', 'logo', 'branding']
  },
  {
    id: '4',
    title: 'Bike Repair & Maintenance',
    description: 'Offering professional bike repair services. All types of bikes welcome!',
    image: 'https://images.unsplash.com/photo-1671543565338-8b22a87b8359?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    type: 'offer',
    category: 'Services',
    location: 'Bronx, NY',
    distance: '8.2 mi',
    valuePoints: 120,
    userId: '4',
    userName: 'Alex Rivera',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    userTrustScore: 97,
    createdAt: '3h ago',
    isFeatured: true,
    tags: ['repair', 'bikes', 'maintenance']
  },
  {
    id: '5',
    title: 'Homemade Meal Prep Services',
    description: 'Healthy, delicious meals prepared weekly. Vegetarian and vegan options available.',
    image: 'https://images.unsplash.com/photo-1612807216087-03678501f4a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    type: 'offer',
    category: 'Food',
    location: 'Staten Island, NY',
    distance: '12.5 mi',
    valuePoints: 200,
    userId: '5',
    userName: 'Maria Garcia',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    userTrustScore: 91,
    createdAt: '6h ago',
    tags: ['food', 'healthy', 'meal-prep']
  },
  {
    id: '6',
    title: 'Need: Moving Help This Weekend',
    description: 'Moving to a new apartment, need 2-3 people to help load/unload truck.',
    image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    type: 'request',
    category: 'Services',
    location: 'Brooklyn, NY',
    distance: '3.1 mi',
    valuePoints: 250,
    cashSweetener: 50,
    userId: '6',
    userName: 'Chris Anderson',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    userTrustScore: 85,
    createdAt: '4h ago',
    tags: ['moving', 'help', 'labor']
  },
];

const recentTrades = [
  { user: 'Sarah C.', action: 'traded Camera for Design Services', time: '5 min ago', vp: 450 },
  { user: 'Mike T.', action: 'offered Custom Desk', time: '12 min ago', vp: 850 },
  { user: 'Jordan L.', action: 'requested Logo Design', time: '18 min ago', vp: 300 },
  { user: 'Alex R.', action: 'completed Bike Repair trade', time: '23 min ago', vp: 120 },
  { user: 'Maria G.', action: 'offered Meal Prep Service', time: '35 min ago', vp: 200 },
];

export function HomePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'offer' | 'request'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredListings = mockListings.filter(listing => {
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
            <div className="max-w-2xl mx-auto mb-8">
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
          </motion.div>

          {/* Split CTA Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-2 border-green-500/20 hover:border-green-500/40 transition-all hover:shadow-lg hover:shadow-green-500/10 group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">I Have Something</h3>
                  <p className="text-muted-foreground mb-6">
                    Offer your goods, skills, or services to the community
                  </p>
                  <Link to="/create-offer">
                    <Button className="w-full" size="lg" variant="default">
                      Create Offer
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-2 border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-500/10 group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">I Need Something</h3>
                  <p className="text-muted-foreground mb-6">
                    Request items, services, or help from community members
                  </p>
                  <Link to="/create-request">
                    <Button className="w-full" size="lg" variant="outline">
                      Create Request
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border/40 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, label: 'Active Traders', value: '12,450+' },
              { icon: TrendingUp, label: 'Trades Completed', value: '45,230+' },
              { icon: Shield, label: 'Trust Score Avg', value: '94.2%' },
              { icon: MapPin, label: 'Cities Covered', value: '230+' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
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
                    {recentTrades.map((trade, index) => (
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
                    ))}
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
                  <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
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
              {viewMode === 'grid' ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <Card className="h-[600px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Map view coming soon...</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Trading?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of community members building a better economy together
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="px-8">
                  Get Started Free
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
