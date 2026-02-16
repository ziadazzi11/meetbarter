"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Clock, Heart, Share2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export interface Listing {
  id: string;
  title: string;
  description: string;
  image: string;
  type: 'offer' | 'request';
  category: string;
  location: string;
  distance?: string;
  valuePoints: number;
  cashSweetener?: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  userTrustScore: number;
  createdAt: string;
  expiresAt?: string;
  isFeatured?: boolean;
  tags: string[];
}

interface ListingCardProps {
  listing: Listing;
  onLike?: () => void;
  onShare?: () => void;
}

export function ListingCard({ listing, onLike, onShare }: ListingCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
        <Link href={`/listings/${listing.id}`}>
          <div className="relative h-48 overflow-hidden bg-muted">
            {/* Use standard img tag if external URL or next/image if configured */}
            <img
              src={listing.image || '/assets/placeholder.png'}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2 flex gap-2">
              <Badge
                className={
                  listing.type === 'offer'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                }
              >
                {listing.type === 'offer' ? '📦 Offering' : '🔍 Seeking'}
              </Badge>
              {listing.isFeatured && (
                <Badge variant="secondary" className="bg-yellow-500 text-black">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur"
                onClick={(e) => {
                  e.preventDefault();
                  handleLike();
                }}
              >
                <Heart
                  className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
                />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur"
                onClick={(e) => {
                  e.preventDefault();
                  onShare?.();
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Link>

        <CardContent className="p-4 flex-1">
          <Link href={`/listings/${listing.id}`}>
            <h3 className="font-semibold mb-2 line-clamp-1 hover:text-primary transition-colors">
              {listing.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {listing.description}
            </p>
          </Link>

          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs">
              {listing.category}
            </Badge>
            {listing.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{listing.location}</span>
              {listing.distance && <span className="text-xs">({listing.distance})</span>}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{listing.createdAt}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={listing.userAvatar} alt={listing.userName} />
                <AvatarFallback>{listing.userName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{listing.userName}</p>
                <p className="text-xs text-muted-foreground">
                  Trust: {listing.userTrustScore}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{listing.valuePoints} VP</p>
              {listing.cashSweetener && (
                <p className="text-xs text-green-500">+${listing.cashSweetener} cash</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Link href={`/listings/${listing.id}`} className="w-full">
            <Button className="w-full" variant={listing.type === 'offer' ? 'default' : 'outline'}>
              {listing.type === 'offer' ? 'Make Offer' : 'I Can Help'}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}