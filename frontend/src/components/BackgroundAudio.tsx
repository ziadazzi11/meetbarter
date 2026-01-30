"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "./ThemeContext";
import { useAudio } from "./AudioContext";

const THEME_TRACKS: Record<string, string> = {
    jungle: '/assets/audio/jungle_ambience.mp3',
    beach: '/assets/audio/beach_ambience.mp3',
    himalaya: '/assets/audio/wind_ambience.mp3',
    sacred_geometry: '/assets/audio/meditation_ambience.mp3',
    farm_night: '/assets/audio/crickets_ambience.mp3',
    sacred_geometry_4d: '/assets/audio/deep_space_ambience.mp3'
};

export default function BackgroundAudio() {
    const { theme } = useTheme();
    const { isPlaying, volume, isMuted } = useAudio();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Handle Volume & Mute
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // Handle Play/Pause
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.log("Autoplay prevented:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    // Handle Theme Change (Track Switch)
    useEffect(() => {
        if (!audioRef.current) return;

        const newSrc = THEME_TRACKS[theme] || THEME_TRACKS['jungle'];
        const currentSrc = audioRef.current.getAttribute('src');

        // Only switch if different (prevent restart on same theme)
        if (currentSrc !== newSrc) {
            // Simple crossfade could go here, but for now simple switch
            audioRef.current.src = newSrc;
            if (isPlaying) {
                audioRef.current.play().catch(e => console.log("Playback error:", e));
            }
        }
    }, [theme, isPlaying]);

    return (
        <audio
            ref={audioRef}
            loop
            preload="auto"
        />
    );
}
