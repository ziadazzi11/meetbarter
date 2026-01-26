"use client";

import { useState, useEffect } from "react";
import ImageUpload from "@/components/ImageUpload";

interface PersonalizationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PersonalizationModal({ isOpen, onClose }: PersonalizationModalProps) {
    const [userId, setUserId] = useState<string | null>(null);
    const [bannerUrl, setBannerUrl] = useState('');
    const [themeConfig, setThemeConfig] = useState({
        font: 'Inter',
        cardColor: '#ffffff',
        textColor: '#1f2937',
        primaryColor: '#2563eb'
    });

    useEffect(() => {
        if (!isOpen) return;

        const uid = localStorage.getItem("meetbarter_uid");
        if (uid) {
            setUserId(uid);
            fetch(`http://localhost:3001/users/me`).then(res => res.json()).then(data => {
                if (data) {
                    if (data.bannerUrl) setBannerUrl(data.bannerUrl);
                    if (data.themePreferences) {
                        try {
                            const parsed = JSON.parse(data.themePreferences);
                            setThemeConfig(prev => ({ ...prev, ...parsed }));
                        } catch (e) {
                            console.error("Error parsing theme", e);
                        }
                    }
                }
            });
        }
    }, [isOpen]);

    const handleSaveTheme = async () => {
        if (!userId) {
            alert("You must be logged in to save your theme customizations.");
            return;
        }
        try {
            const payload = {
                bannerUrl,
                themePreferences: JSON.stringify(themeConfig)
            };
            await fetch(`http://localhost:3001/users/${userId}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            alert("Theme Saved! Refresh to see changes.");
            window.location.reload();
        } catch (e) {
            alert("Failed to save theme");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-900">Customize Your Experience</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {/* Banner Upload */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Banner</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            {bannerUrl ? (
                                <div className="relative">
                                    <img src={bannerUrl} alt="Banner" className="w-full h-32 object-cover rounded-md mb-2" />
                                    <button onClick={() => setBannerUrl('')} className="text-red-600 text-sm underline">Remove Banner</button>
                                </div>
                            ) : (
                                <div className="text-gray-500">
                                    <ImageUpload
                                        initialImages={[]}
                                        onUpload={(urls) => setBannerUrl(urls[0])}
                                        maxImages={1}
                                    />
                                    <p className="text-xs mt-2">Recommended size: 1200x300px</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Typography */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Typography</label>
                        <select
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            value={themeConfig.font}
                            onChange={(e) => setThemeConfig({ ...themeConfig, font: e.target.value })}
                            title="Font Selection"
                        >
                            <option value="Inter">Inter (System Standard)</option>
                            <option value="Serif">Elegant Serif</option>
                            <option value="Monospace">Coder Monospace</option>
                            <option value="Comic Sans MS">Playful Marker</option>
                        </select>
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Window/Card Color</label>
                            <div className="flex items-center gap-2 p-2 border rounded-lg">
                                <input
                                    type="color"
                                    value={themeConfig.cardColor}
                                    onChange={(e) => setThemeConfig({ ...themeConfig, cardColor: e.target.value })}
                                    className="h-8 w-8 rounded cursor-pointer border-none"
                                    title="Card Color Picker"
                                />
                                <span className="text-sm text-gray-500">{themeConfig.cardColor}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Text Color</label>
                            <div className="flex items-center gap-2 p-2 border rounded-lg">
                                <input
                                    type="color"
                                    value={themeConfig.textColor}
                                    onChange={(e) => setThemeConfig({ ...themeConfig, textColor: e.target.value })}
                                    className="h-8 w-8 rounded cursor-pointer border-none"
                                    title="Text Color Picker"
                                />
                                <span className="text-sm text-gray-500">{themeConfig.textColor}</span>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSaveTheme}
                        className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        Save & Apply Theme
                    </button>

                    <div className="mt-4 text-center">
                        <button onClick={onClose} className="text-gray-500 text-sm hover:text-gray-700">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
