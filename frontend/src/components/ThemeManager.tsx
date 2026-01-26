"use client";

import { useEffect } from "react";

export default function ThemeManager() {
    useEffect(() => {
        const uid = localStorage.getItem("meetbarter_uid");
        if (!uid) return;

        fetch(`http://localhost:3001/users/me`)
            .then(res => res.json())
            .then(data => {
                if (data && data.themePreferences) {
                    try {
                        const theme = JSON.parse(data.themePreferences);

                        // Apply Fonts
                        if (theme.font) {
                            document.body.style.fontFamily = theme.font === 'Inter' ? 'var(--font-geist-sans), sans-serif' : theme.font;
                        }

                        // Apply Colors using CSS Variables
                        if (theme.cardColor) {
                            document.documentElement.style.setProperty('--card-bg', theme.cardColor);
                        }
                        if (theme.textColor) {
                            document.documentElement.style.setProperty('--text-main', theme.textColor);
                        }
                        if (theme.primaryColor) {
                            document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
                        }

                    } catch (e) {
                        console.error("Failed to apply theme", e);
                    }
                }
            })
            .catch(() => { });
    }, []);

    return null; // Logic only component
}
