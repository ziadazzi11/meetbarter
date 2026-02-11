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
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group transition-all duration-300 hover:premium-shadow hover:-translate-y-2">
            {/* Image Section */}
            <div className="h-56 bg-gray-100/50 flex items-center justify-center relative overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                        <span className="text-5xl">📦</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">No Image</span>
                    </div>
                )}

                {/* VP Badge */}
                <div className="absolute top-4 right-4 glass-card px-3 py-1.5 rounded-full text-xs font-black shadow-lg text-indigo-600 bg-white/90">
                    {listing.priceVP} VP
                </div>

                {/* Scrim overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight line-clamp-1 group-hover:text-indigo-600 transition-colors" title={listing.title}>
                        {listing.title}
                    </h3>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-bold uppercase tracking-wider border border-indigo-100/50 dark:border-indigo-800/50">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="truncate max-w-[100px]">{listing.location || 'Unknown'}</span>
                    </span>

                    {listing.condition && (
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-extrabold uppercase tracking-wider border ${listing.condition === 'NEW'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                : 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
                            }`}>
                            {listing.condition.replace('_', ' ')}
                        </span>
                    )}
                </div>

                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                    {listing.description}
                </p>

                <Link href={`/listings/${listing.id}`} className="block text-center w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-black transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 uppercase tracking-widest">
                    View Asset
                </Link>
            </div>
        </div>
    );
}
