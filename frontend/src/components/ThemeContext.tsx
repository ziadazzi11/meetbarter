"use client";

import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';

export type Theme = 'jungle' | 'beach' | 'himalaya' | 'sacred_geometry' | 'farm_night' | 'sacred_geometry_4d';

interface ThemeContextProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isAutoMode: boolean;
    setIsAutoMode: (isAuto: boolean) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>('jungle');
    const [isAutoMode, setIsAutoMode] = useState(true);

    // Initialize from localStorage on mount
    useEffect(() => {
        const storedAuto = localStorage.getItem('meetbarter_isAutoMode');
        if (storedAuto !== null) {
            setIsAutoMode(storedAuto === 'true');
        }
    }, []);

    // Sync to localStorage
    useEffect(() => {
        localStorage.setItem('meetbarter_isAutoMode', String(isAutoMode));
    }, [isAutoMode]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isAutoMode, setIsAutoMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextProps => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
