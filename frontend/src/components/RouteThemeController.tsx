"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme, Theme } from './ThemeContext';

/**
 * RouteThemeController automatically updates the background theme based on the user's
 * navigation journey ("The Maze"). It listens to route changes and applies the
 * corresponding theme if Auto Mode is enabled.
 */
export default function RouteThemeController() {
    const pathname = usePathname();
    const { isAutoMode, setTheme } = useTheme();

    useEffect(() => {
        if (!isAutoMode) return;

        let targetTheme: Theme = 'jungle';

        if (pathname === '/' || pathname === '/login' || pathname === '/register') {
            targetTheme = 'jungle';
        } else if (pathname.startsWith('/dashboard')) {
            targetTheme = 'beach';
        } else if (pathname.startsWith('/listings')) {
            targetTheme = 'himalaya';
        } else if (pathname.startsWith('/trades')) {
            targetTheme = 'sacred_geometry';
        } else if (pathname.startsWith('/profile')) {
            targetTheme = 'farm_night';
        } else if (pathname.startsWith('/admin')) {
            targetTheme = 'sacred_geometry_4d';
        }

        setTheme(targetTheme);

    }, [pathname, isAutoMode, setTheme]);

    return null; // Logic only, no UI
}
