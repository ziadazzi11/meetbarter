import Link from 'next/link';
import Image from 'next/image';

interface ListingProps {
    id: string;
    title: string;
    description: string;
    priceVP: number;
    images: string; // JSON string
    location: string;
    condition?: string;
}

export function ListingCard({ listing }: { listing: ListingProps }) {
    let imageUrl = '';
    try {
        const parsed = JSON.parse(listing.images);
        imageUrl = parsed[0] || '';
    } catch { }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden flex flex-col h-full group">
            <div className="h-48 bg-gray-100 flex items-center justify-center text-4xl relative overflow-hidden">
                {imageUrl ? (
                    <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <span className="text-gray-300">📦</span>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm text-gray-800">
                    {listing.priceVP} VP
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1" title={listing.title}>{listing.title}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1 border border-gray-200">
                        <span className="truncate max-w-[80px]">{listing.location || 'Unknown'}</span>
                    </span>
                    {listing.condition && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${listing.condition === 'NEW' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                            {listing.condition.replace('_', ' ')}
                        </span>
                    )}
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">{listing.description}</p>
                <Link href={`/listings/${listing.id}`} className="block text-center w-full bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 py-2 rounded-lg text-sm font-bold transition-colors border border-gray-100 hover:border-indigo-100">
                    View Details
                </Link>
            </div>
        </div>
    );
}
