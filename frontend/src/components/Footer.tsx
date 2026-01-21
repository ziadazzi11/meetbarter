"use client";

import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-12 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <img src="/assets/logo-alt.png" alt="Meetbarter" className="object-contain" style={{ height: '30px', width: 'auto' }} />
                        <p className="text-sm text-gray-500 mt-1">
                            &copy; {new Date().getFullYear()} <a href="https://meetbarter.com" className="hover:text-blue-600">meetbarter.com</a>. All rights reserved.
                        </p>
                    </div>

                    <div className="flex space-x-6">
                        <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">
                            Terms
                        </Link>
                        <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">
                            Privacy
                        </Link>
                        <Link href="/ambassador" className="text-sm text-gray-500 hover:text-gray-900">
                            Ambassadors
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
