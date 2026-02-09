'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// Dynamically import MapLogic with SSR disabled to avoid 'window is not defined'
const MapLogic = dynamic(() => import('./MapLogic'), {
    loading: () => <div className="p-12 text-center bg-gray-100 rounded-xl h-[400px] flex items-center justify-center">Loading Interactive Map...</div>,
    ssr: false
});

interface Listing {
    id: string;
    title: string;
    description: string;
    priceVP: number;
    location: string;
    images: string;
    type: 'OFFER' | 'REQUEST';
}

interface MapViewerProps {
    listings: Listing[];
}

export default function MapViewer({ listings }: MapViewerProps) {
    const mapListings = useMemo(() => listings, [listings]);

    return (
        <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border-2 border-white">
            <MapLogic listings={mapListings} />
        </div>
    );
}
