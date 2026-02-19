"use client";

import { Shield, Lock, UserCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TrustSafetyPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Trust & Safety</h1>
                <p className="text-xl text-muted-foreground">Your safety is our top priority.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="text-center p-6 border rounded-lg bg-card">
                    <UserCheck className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Verified Profiles</h3>
                    <p className="text-muted-foreground">We use multi-step verification to ensure you know who you're trading with.</p>
                </div>
                <div className="text-center p-6 border rounded-lg bg-card">
                    <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Secure Trading</h3>
                    <p className="text-muted-foreground">Our escrow-like system ensures fair exchanges for everyone.</p>
                </div>
                <div className="text-center p-6 border rounded-lg bg-card">
                    <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Community Watch</h3>
                    <p className="text-muted-foreground">Active moderation and community reporting keep bad actors out.</p>
                </div>
            </div>

            <div className="bg-muted/30 p-8 rounded-lg text-center">
                <AlertTriangle className="h-10 w-10 text-orange-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">See something suspicious?</h2>
                <p className="mb-6">If you encounter any behavior that violates our guidelines, please report it immediately.</p>
                <Link href="/report">
                    <Button variant="destructive">Report an Issue</Button>
                </Link>
            </div>
        </div>
    );
}
