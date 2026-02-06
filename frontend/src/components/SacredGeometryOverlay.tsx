'use client';

import React from 'react';
import { useTheme } from './ThemeContext';
import styles from './SacredGeometryOverlay.module.css';

export default function SacredGeometryOverlay() {
    const { theme } = useTheme();

    return (
        <div className={styles.overlay} aria-hidden="true">
            {/* Animated sacred geometry overlay */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 animate-spin-slow ${theme === 'sacred_geometry_4d' ? styles.svg3d : ''}`}>
                <svg width="600" height="600" viewBox="0 0 600 600" className="sacred-geometry-svg">
                    {/* Flower of Life pattern core */}
                    <circle cx="300" cy="300" r="50" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400" />

                    {/* Six surrounding circles (Seed of Life) */}
                    {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                        const rad = (angle * Math.PI) / 180;
                        const x = 300 + 50 * Math.cos(rad);
                        const y = 300 + 50 * Math.sin(rad);
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="50"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="text-amber-400"
                            />
                        );
                    })}

                    {/* Outer circle rings (Expanding Flower of Life) */}
                    <circle cx="300" cy="300" r="100" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-300 opacity-70" />
                    <circle cx="300" cy="300" r="150" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-amber-200 opacity-50" />
                    <circle cx="300" cy="300" r="200" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-100 opacity-30" />

                    {/* Merkabah / Star Tetrahedron geometry */}
                    <path
                        d="M 300 150 L 386.6 350 L 213.4 350 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-amber-300 opacity-40"
                    />
                    <path
                        d="M 300 450 L 213.4 250 L 386.6 250 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-amber-300 opacity-40"
                    />
                </svg>
            </div>

            {/* Ambient particles for extra depth */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <Particles count={30} />
            </div>
        </div>
    );
}

function Particles({ count }: { count: number }) {
    const [particles, setParticles] = React.useState<Array<{
        left: string;
        top: string;
        width: string;
        height: string;
        animationDelay: string;
        animationDuration: string;
    }>>([]);

    React.useEffect(() => {
        setParticles(Array.from({ length: count }).map(() => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${10 + Math.random() * 20}s`,
        })));
    }, [count]);

    return (
        <>
            {particles.map((style, i) => (
                <div
                    key={i}
                    className="particle"
                    style={style}
                />
            ))}
        </>
    );
}
