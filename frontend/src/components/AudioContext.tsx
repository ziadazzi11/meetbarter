"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AudioContextProps {
    isPlaying: boolean;
    togglePlay: () => void;
    volume: number;
    setVolume: (volume: number) => void;
    isMuted: boolean;
    toggleMute: () => void;
}

const AudioContext = createContext<AudioContextProps | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
    const [isPlaying, setIsPlaying] = useState(false); // Default to off for UX politeness
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);

    // Initialize from localStorage
    useEffect(() => {
        const storedVol = localStorage.getItem('meetbarter_volume');
        if (storedVol) setVolume(parseFloat(storedVol));

        const storedMute = localStorage.getItem('meetbarter_muted');
        if (storedMute) setIsMuted(storedMute === 'true');
    }, []);

    // Persist changes
    useEffect(() => {
        localStorage.setItem('meetbarter_volume', String(volume));
        localStorage.setItem('meetbarter_muted', String(isMuted));
    }, [volume, isMuted]);

    const togglePlay = () => setIsPlaying(!isPlaying);
    const toggleMute = () => setIsMuted(!isMuted);

    return (
        <AudioContext.Provider value={{ isPlaying, togglePlay, volume, setVolume, isMuted, toggleMute }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = (): AudioContextProps => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
