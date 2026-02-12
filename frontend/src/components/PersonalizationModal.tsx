"use client";

import { useState, useEffect } from "react";
import ImageUpload from "@/components/ImageUpload";
import { useTheme } from "./ThemeContext";
import { API_BASE_URL } from "@/config/api";

interface PersonalizationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PersonalizationModal({ isOpen, onClose }: PersonalizationModalProps) {
    const {
        theme: currentTheme,
        setTheme,
        isAutoMode,
        setIsAutoMode,
        darkMode,
        setDarkMode
    } = useTheme() as any;
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
            if (userId !== uid) setUserId(uid);
            fetch(`${API_BASE_URL}/users/me`).then(res => res.json()).then(data => {
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
            await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
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
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Customize Your Experience</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close Modal" title="Close">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {/* Banner Upload */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Banner</label>
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Typography</label>
                        <select
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
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

                    {/* Background Scenery (New) */}
                    <div className="mb-6 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <label className="text-sm font-bold text-gray-900 dark:text-white block">Background Scenery</label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {isAutoMode ? 'Dynamic theme based on your journey' : 'You are in control'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-medium ${isAutoMode ? 'text-indigo-600' : 'text-gray-500'}`}>
                                    {isAutoMode ? 'Auto-Journey Active' : 'Manual Mode'}
                                </span>
                                <button
                                    onClick={() => setIsAutoMode(!isAutoMode)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isAutoMode ? 'bg-indigo-600' : 'bg-gray-200'
                                        }`}
                                    role="switch"
                                    aria-checked={isAutoMode}
                                    title={isAutoMode ? "Switch to Manual Mode" : "Switch to Auto-Journey Mode"}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAutoMode ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {isAutoMode && (
                            <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100 flex items-start gap-2">
                                <span className="text-base">💡</span>
                                <p>
                                    <strong>"Auto-Journey" is ON.</strong> The background changes automatically as you navigate the app.
                                    <br />
                                    <span className="underline cursor-pointer" onClick={() => setIsAutoMode(false)}>Click here to switch to Manual Mode</span> if you want to pick a specific background.
                                </p>
                            </div>
                        )}

                        <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 transition-opacity ${isAutoMode ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
                            {[
                                { id: 'jungle', label: 'Jungle Maze' },
                                { id: 'beach', label: 'Sunrise Beach' },
                                { id: 'himalaya', label: 'Himalayas' },
                                { id: 'sacred_geometry', label: 'Sacred Geo' },
                                { id: 'farm_night', label: 'Farm Night' },
                                { id: 'sacred_geometry_4d', label: '4D Dimension' },
                                { id: 'neon-blue', label: 'Neon Blue (Xtribe)' },
                            ].map((scenery) => (
                                <button
                                    key={scenery.id}
                                    disabled={isAutoMode}
                                    onClick={() => setTheme(scenery.id as any)}
                                    className={`p-2 text-xs rounded-lg border text-center transition-all ${currentTheme === scenery.id
                                        ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 font-bold text-indigo-700 shadow-md'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {scenery.label}
                                </button>
                            ))}
                        </div>
                        {isAutoMode && (
                            <p className="text-[10px] text-center text-indigo-600 mt-3 font-medium">
                                Switch to "Manual Control" to select a specific background.
                            </p>
                        )}
                    </div>

                    {/* App Appearance (Dark/Light Mode) */}
                    <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <div>
                                <label className="text-sm font-bold text-gray-900 dark:text-white block">Appearance</label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {darkMode ? 'Dark Mode Active' : 'Light Mode Active'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-medium ${darkMode ? 'text-indigo-400' : 'text-gray-500'}`}>
                                    {darkMode ? 'Dark' : 'Light'}
                                </span>
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${darkMode ? 'bg-indigo-600' : 'bg-gray-200'
                                        }`}
                                    role="switch"
                                    aria-checked={darkMode}
                                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${darkMode ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
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
