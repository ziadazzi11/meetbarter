"use client";

import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';

export type Theme = 'jungle' | 'beach' | 'himalaya' | 'sacred_geometry' | 'farm_night' | 'sacred_geometry_4d' | 'neon-blue';

interface ThemeContextProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isAutoMode: boolean;
    setIsAutoMode: (isAuto: boolean) => void;
    darkMode: boolean;
    setDarkMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // const [theme, setTheme] = useState<Theme>('neon-blue'); // Default to nice but irrelevant
    const [theme, setTheme] = useState<Theme>('neon-blue');
    const [isAutoMode, setIsAutoMode] = useState(false); // Disable auto logic
    const [darkMode, setDarkMode] = useState(true);

    // Initialize from localStorage on mount
    useEffect(() => {
        const storedAuto = localStorage.getItem('meetbarter_isAutoMode');
        if (storedAuto !== null) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setIsAutoMode(storedAuto === 'true');
        }
        const storedDark = localStorage.getItem('meetbarter_darkMode');
        if (storedDark !== null) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setDarkMode(storedDark === 'true');
        }
    }, []);

    // Sync to localStorage
    useEffect(() => {
        localStorage.setItem('meetbarter_isAutoMode', String(isAutoMode));
    }, [isAutoMode]);

    useEffect(() => {
        localStorage.setItem('meetbarter_darkMode', String(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isAutoMode, setIsAutoMode, darkMode, setDarkMode }}>
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
