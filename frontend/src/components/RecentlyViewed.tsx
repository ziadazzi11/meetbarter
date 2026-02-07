'use client';

import { useState } from 'react';

export default function RecentlyViewed() {
    const [recentItems, _] = useState<any[]>([]);

    // This would load from localStorage in a real implementation
    // useEffect(() => {
    //   const items = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    //   setRecentItems(items.slice(0, 5));
    // }, []);

    if (recentItems.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Recently Viewed</h2>
            <div className="space-y-3">
                {recentItems.map((item) => (
                    <a
                        key={item.id}
                        href={`/listings/${item.id}`}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition"
                    >
                        <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.title}</p>
                            <p className="text-sm text-blue-600">{item.priceVP} VP</p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
