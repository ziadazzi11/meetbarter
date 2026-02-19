"use client";

import { Info } from "lucide-react";

export default function CookiesPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="mb-8 flex items-center gap-3">
                <Info className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Cookie Policy</h1>
            </div>
            <div className="prose dark:prose-invert max-w-none">
                <p>MeetBarter uses cookies to improve your experience on our platform.</p>
                <h2 className="text-2xl font-semibold mt-8 mb-4">What act cookies?</h2>
                <p>Cookies are small text files that are placed on your device/computer by websites that you visit.</p>
                <h2 className="text-2xl font-semibold mt-8 mb-4">How we use cookies</h2>
                <p>We use cookies to remember your login state, preferences, and to analyze how our platform is used.</p>
            </div>
        </div>
    );
}
