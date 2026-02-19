"use client";

import { Shield } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="mb-8 flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Terms of Service</h1>
            </div>
            <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
                <p>Welcome to MeetBarter. By accessing our website and using our services, you agree to be bound by these Terms of Service.</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">2. Community Guidelines</h2>
                <p>MeetBarter is a community-driven platform. We expect all users to treat each other with respect and honesty. Harassment, hate speech, and fraudulent activities are strictly prohibited.</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">3. Trading Rules</h2>
                <p>All trades are conducted at the risk of the parties involved. MeetBarter provides the platform for connection but is not responsible for the quality or delivery of goods and services exchanged.</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Value Points (VP)</h2>
                <p>Value Points are an internal currency used to facilitate trades. They have no monetary value outside of the MeetBarter platform and cannot be exchanged for fiat currency.</p>
            </div>
        </div>
    );
}
