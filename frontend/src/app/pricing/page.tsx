"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
    return (
        <div className="container mx-auto py-16 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
                <p className="text-xl text-muted-foreground">Start for free, upgrade for power features.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Free Tier */}
                <div className="border rounded-xl p-8 bg-card shadow-sm">
                    <h3 className="text-xl font-bold">Community</h3>
                    <div className="text-4xl font-bold mt-4 mb-2">$0<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                    <p className="text-muted-foreground mb-6">Perfect for casual traders.</p>
                    <Button variant="outline" className="w-full mb-6">Get Started</Button>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 5 Active Listings</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Basic Search</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Community Support</li>
                    </ul>
                </div>

                {/* Pro Tier */}
                <div className="border-2 border-primary rounded-xl p-8 bg-card shadow-lg relative transform scale-105">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                        Most Popular
                    </div>
                    <h3 className="text-xl font-bold">Pro Trader</h3>
                    <div className="text-4xl font-bold mt-4 mb-2">$9<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                    <p className="text-muted-foreground mb-6">For serious barterers.</p>
                    <Button className="w-full mb-6">Upgrade Now</Button>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Unlimited Listings</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Verified Badge</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Priority Support</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 0% Transaction Fees</li>
                    </ul>
                </div>

                {/* Business Tier */}
                <div className="border rounded-xl p-8 bg-card shadow-sm">
                    <h3 className="text-xl font-bold">Business</h3>
                    <div className="text-4xl font-bold mt-4 mb-2">$29<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                    <p className="text-muted-foreground mb-6">For local businesses.</p>
                    <Button variant="outline" className="w-full mb-6">Contact Sales</Button>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Business Profile</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Analytics Dashboard</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Featured Listings</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
