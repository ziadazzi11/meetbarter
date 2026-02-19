"use client";

import { Shield } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="mb-8 flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Privacy Policy</h1>
            </div>
            <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you create an account, create a listing, or communicate with other users.</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
                <p>We use your information to provide, maintain, and improve our services, facilitate trades, and communicate with you.</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">3. Information Sharing</h2>
                <p>We do not sell your personal information. We may share your information with other users as necessary to facilitate trades (e.g., sharing your profile with a trade partner).</p>
            </div>
        </div>
    );
}
