
import React, { useState } from 'react';

interface TradeReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (rating: number, comment: string) => void;
    revieweeName: string;
}

export default function TradeReviewModal({ isOpen, onClose, onConfirm, revieweeName }: TradeReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">⭐</div>
                    <h2 className="text-2xl font-bold text-gray-900">Rate your experience</h2>
                    <p className="text-sm text-gray-500 mt-2">How was your trade with <strong>{revieweeName}</strong>?</p>
                </div>

                <div className="space-y-6">
                    {/* Rating Stars */}
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`text-4xl transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2 tracking-wider">
                            Your Comments
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Share your thoughts about the trade..."
                            rows={4}
                        />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl text-[10px] text-blue-700 leading-relaxed italic border border-blue-100">
                        &quot;Reviews help build trust in the MeetBarter community. Be honest, professional, and fair.&quot;
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(rating, comment)}
                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
                    >
                        Submit Review
                    </button>
                </div>
            </div>
        </div>
    );
}
