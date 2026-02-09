'use client';

import { useState, useEffect, useRef } from 'react';

interface SearchAutocompleteProps {
    onSelect?: (query: string) => void;
}

export default function SearchAutocomplete({ onSelect }: SearchAutocompleteProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (query.length < 2) return;

        // Fetch suggestions from API
        const fetchSuggestions = async () => {
            try {
                const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setSuggestions(data.suggestions || []);
            } catch (error) {
                console.error('Autocomplete error:', error);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (suggestion: string) => {
        setQuery(suggestion);
        setShowSuggestions(false);
        if (onSelect) onSelect(suggestion);
    };

    return (
        <div className="relative w-full">
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                    const val = e.target.value;
                    setQuery(val);
                    if (val.length < 2) setSuggestions([]);
                    setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search for items..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelect(suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 transition"
                        >
                            <span className="text-gray-900">{suggestion}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
