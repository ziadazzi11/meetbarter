import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Heart,
  Share2,
  MessageSquare,
  Shield,
  TrendingUp,
  Star,
  Calendar,
  Package,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

export function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  // Mock listing data
  const listing = {
    id: id || '1',
    title: 'Vintage Film Camera - Perfect Condition',
    description: `This beautiful Canon AE-1 is in excellent condition and ready for a new home. 
    
    Includes:
    - Canon AE-1 camera body
    - 50mm f/1.8 lens
    - Original leather case
    - Strap and lens cap
    - Fresh battery
    
    The camera has been tested and works perfectly. All shutter speeds are accurate, the light meter is working properly, and there are no issues with the film advance mechanism. The lens is clean with no fungus or scratches.
    
    I've been using this camera for the past 5 years and it's produced amazing results. I'm looking to trade for graphic design services or web development work for my new business.`,
    images: [
      'https://images.unsplash.com/photo-1588420635201-3a9e2a2a0a07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      'https://images.unsplash.com/photo-1606980707002-3d2a0ca0aeb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    type: 'offer' as const,
    category: 'Electronics',
    location: 'Brooklyn, NY',
    distance: '2.3 mi',
    valuePoints: 450,
    cashSweetener: 0,
    userId: '1',
    userName: 'Sarah Chen',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    userTrustScore: 95,
    userTotalTrades: 34,
    userMemberSince: 'Jan 2024',
    createdAt: '2 hours ago',
    expiresAt: '30 days',
    views: 234,
    interested: 12,
    tags: ['camera', 'vintage', 'photography', 'canon', 'film'],
  };

  const handleMakeOffer = () => {
    toast.success('Trade request sent!');
  };

  const handleMessage = () => {
    toast.info('Opening chat...');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge
                      className={
                        listing.type === 'offer'
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }
                    >
                      {listing.type === 'offer' ? '📦 Offering' : '🔍 Seeking'}
                    </Badge>
                    <Badge variant="secondary">{listing.category}</Badge>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-10 w-10 rounded-full bg-background/80 backdrop-blur"
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart
                        className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
                      />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-10 w-10 rounded-full bg-background/80 backdrop-blur"
                      onClick={handleShare}
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                {/* Thumbnail Gallery */}
                {listing.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-4">
                    {listing.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary cursor-pointer transition-colors"
                      >
                        <img src={img} alt={`${listing.title} ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {listing.location}
                        <span className="text-xs">({listing.distance})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {listing.createdAt}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-primary mb-1">
                      {listing.valuePoints} VP
                    </div>
                    {listing.cashSweetener > 0 && (
                      <p className="text-sm text-green-500">+${listing.cashSweetener} cash</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="description">
                  <TabsList className="mb-4">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="space-y-4">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {listing.description.split('\n').map((para, idx) => (
                        <p key={idx} className="mb-3 text-muted-foreground whitespace-pre-line">
                          {para}
                        </p>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {listing.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Category</p>
                        <p className="font-medium">{listing.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Type</p>
                        <p className="font-medium capitalize">{listing.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Views</p>
                        <p className="font-medium">{listing.views}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Interested</p>
                        <p className="font-medium">{listing.interested} people</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Listed</p>
                        <p className="font-medium">{listing.createdAt}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Expires</p>
                        <p className="font-medium">{listing.expiresAt}</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={listing.userAvatar} alt={listing.userName} />
                    <AvatarFallback>{listing.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Link to={`/users/${listing.userId}`}>
                      <h3 className="font-semibold hover:text-primary transition-colors">
                        {listing.userName}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-green-500 text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Trust Score
                    </span>
                    <span className="font-bold text-primary">{listing.userTrustScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Total Trades
                    </span>
                    <span className="font-medium">{listing.userTotalTrades}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </span>
                    <span className="font-medium">{listing.userMemberSince}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button className="w-full" onClick={handleMakeOffer}>
                    {listing.type === 'offer' ? 'Make Offer' : 'I Can Help'}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleMessage}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Meet in a public place for exchanges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Check the seller's trust score and reviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Use the platform's messaging system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Report suspicious activity immediately</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
