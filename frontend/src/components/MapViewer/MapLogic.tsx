'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import Link from 'next/link';

interface Listing {
    id: string;
    title: string;
    description: string;
    priceVP: number;
    location: string;
    images: string;
    type: 'OFFER' | 'REQUEST';
}

interface MapLogicProps {
    listings: Listing[];
}

// Mock Geocoding Data (Center Points)
const CITY_COORDS: Record<string, [number, number]> = {
    'Beirut': [33.8938, 35.5018],
    'Jounieh': [33.9697, 35.6156],
    'Tripoli': [34.4367, 35.8497],
    'Byblos': [34.1230, 35.6519],
    'Sidon': [33.5599, 35.3756],
    'Tyre': [33.2733, 35.1939],
    'Zahle': [33.8463, 35.9020],
    'Baalbek': [34.0058, 36.2181],
    'Lebanon': [33.8547, 35.8623],
};

const DEFAULT_CENTER: [number, number] = [33.8938, 35.5018]; // Beirut

export default function MapLogic({ listings }: MapLogicProps) {

    // Helper to get coords with jitter
    const getCoords = (location: string): [number, number] => {
        // Simple normalization
        const city = Object.keys(CITY_COORDS).find(c => location.toLowerCase().includes(c.toLowerCase()));

        const baseCoords = city ? CITY_COORDS[city] : CITY_COORDS['Lebanon']; // Default center

        // Add random jitter (-0.02 to +0.02 degrees ~ 2km) to spread pins out
        const latJitter = (Math.random() - 0.5) * 0.04;
        const lngJitter = (Math.random() - 0.5) * 0.04;

        return [baseCoords[0] + latJitter, baseCoords[1] + lngJitter];
    };

    return (
        <MapContainer center={DEFAULT_CENTER} zoom={10} scrollWheelZoom={true} className="h-full w-full rounded-xl z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {listings.map((listing) => {
                const position = getCoords(listing.location);
                // Parse image
                let imgUrl = '';
                try { imgUrl = JSON.parse(listing.images)[0] } catch { }

                return (
                    <Marker key={listing.id} position={position}>
                        <Popup>
                            <div className="w-48 text-center">
                                {imgUrl && (
                                    <div className="w-full h-24 mb-2 overflow-hidden rounded">
                                        <img src={imgUrl} alt={listing.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <h3 className="font-bold text-sm mb-1">{listing.title}</h3>
                                <p className="text-xs text-gray-500 mb-2">{listing.location}</p>
                                <div className="font-bold text-blue-600 mb-2">{listing.priceVP} VP</div>
                                <Link href={`/listings/${listing.id}`} className="block w-full bg-meetbarter-black text-white text-xs py-1 rounded">
                                    View Details
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
