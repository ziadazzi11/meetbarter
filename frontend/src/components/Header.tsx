"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith('/dashboard');

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo Section */}
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-1 group">
                    {/* Main Logo */}
                    <div>
                        <img src="/assets/logo-full.png" alt="Meetbarter" className="object-contain" style={{ height: '40px', width: 'auto' }} />
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/listings/new" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Post Listing
                    </Link>
                    <Link href="/ambassador" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Ambassadors
                    </Link>
                    {isDashboard ? (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            Dashboard Active
                        </span>
                    ) : (
                        <Link href="/dashboard" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                            My Dashboard
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
