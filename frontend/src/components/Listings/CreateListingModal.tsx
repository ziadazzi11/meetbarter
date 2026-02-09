import { useState, useEffect } from 'react';
import ImageUpload from "@/components/ImageUpload";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Category {
    id: string;
    name: string;
}

interface CommunityEvent {
    id: string;
    title: string;
    status: string;
}

interface CreateListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSuccess: () => void;
    categories: Category[];
    initialType?: 'OFFER' | 'REQUEST';
}

export default function CreateListingModal({ isOpen, onClose, userId, onSuccess, categories, initialType = 'OFFER' }: CreateListingModalProps) {
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<CommunityEvent[]>([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const { user, token } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        country: 'Lebanon',
        categoryId: '',
        originalPrice: 0,
        listingType: initialType,
        condition: 'USED_GOOD',
        images: [] as string[]
    });

    useEffect(() => {
        if (isOpen) {
            fetchEvents();
        }
    }, [isOpen]);

    const handleBulkOpen = () => {
        // We need to trigger this from parent or use context. 
        // Since CreateListingModal is for single, we need a new state in page.tsx for BulkModal.
    };

    const fetchEvents = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/events`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) {
                throw new Error('Failed to fetch events');
            }
            const data = await res.json();
            setEvents(data.filter((e: CommunityEvent) => e.status !== 'COMPLETED'));
        } catch (error) {
            console.error("Error fetching events:", error);
            alert("Failed to load events.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Safety Check: Max Photos
        if (formData.images.length > 5) {
            alert("Maximum 5 photos allowed.");
            return;
        }

        // Safety Check: No Phone Numbers
        const phonePattern = /(?:\d[\s-]*){8,}/;
        if (phonePattern.test(formData.title) || phonePattern.test(formData.description)) {
            alert("For your safety & privacy, please do not include phone numbers in public listings.\n\nContact details are automatically revealed to the other party once a trade is approved.");
            return;
        }

        setLoading(true);
        try {
            const body = {
                ...formData,
                sellerId: userId,
                images: JSON.stringify(formData.images.filter(img => img !== "")),
                communityEventId: selectedEventId || undefined
            };

            const res = await fetch(`${API_BASE_URL}/listings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const err = await res.text();
                throw new Error(err);
            }

            alert("Listing Created Successfully!");
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                title: '',
                description: '',
                location: '',
                country: 'Lebanon',
                categoryId: '',
                originalPrice: 0,
                listingType: 'OFFER',
                condition: 'USED_GOOD',
                images: []
            });
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {formData.listingType === 'REQUEST' ? 'Post a Request' : 'List a New Item'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    id="title"
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder={formData.listingType === 'REQUEST' ? "What do you need?" : "What are you listing?"}
                                />
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    id="category"
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={formData.categoryId}
                                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            {events.length > 0 && (
                                <div className="col-span-2 md:col-span-1">
                                    <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-1">Participate in Event (Optional)</label>
                                    <select
                                        id="event"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        value={selectedEventId}
                                        onChange={e => setSelectedEventId(e.target.value)}
                                    >
                                        <option value="">None</option>
                                        {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                id="description"
                                required
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">City / Location</label>
                                <input
                                    id="location"
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. Beirut"
                                />
                            </div>
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <select
                                    id="country"
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={formData.country}
                                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                                >
                                    <option value="Lebanon">Lebanon</option>
                                    <option value="USA">USA</option>
                                    <option value="France">France</option>
                                    <option value="UAE">UAE</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Value (VP)</label>
                                <input
                                    id="price"
                                    type="number"
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={formData.originalPrice}
                                    onChange={e => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                <select
                                    id="condition"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={formData.condition}
                                    onChange={e => setFormData({ ...formData, condition: e.target.value })}
                                >
                                    <option value="NEW">New (60%)</option>
                                    <option value="USED_GOOD">Used - Good (30%)</option>
                                    <option value="USED_FAIR">Used - Fair (20%)</option>
                                </select>
                            </div>
                        </div>

                        {formData.listingType === 'OFFER' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Photos (Max 5)</label>
                                <ImageUpload
                                    initialImages={formData.images}
                                    onUpload={(urls) => setFormData({ ...formData, images: urls })}
                                    maxImages={5}
                                />
                            </div>
                        )}

                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Creating...' : (formData.listingType === 'REQUEST' ? 'Post Request' : 'Create Listing')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
