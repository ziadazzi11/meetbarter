"use client";

import { ArrowRight, UserPlus, Search, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HowItWorksPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <h1 className="text-4xl font-bold mb-12 text-center">How MeetBarter Works</h1>

            <div className="space-y-12">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 text-center md:text-right">
                        <h3 className="text-2xl font-bold mb-2">1. Join & List</h3>
                        <p className="text-muted-foreground">Create your free account and list items or services you have to offer. Or, post a request for something you need.</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <UserPlus className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 md:block hidden"></div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 md:block hidden"></div>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Search className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold mb-2">2. Connect & Negotiate</h3>
                        <p className="text-muted-foreground">Find a match in the marketplace. Chat securely to agree on terms and Value Points (VP).</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 text-center md:text-right">
                        <h3 className="text-2xl font-bold mb-2">3. Trade & Rate</h3>
                        <p className="text-muted-foreground">Complete the exchange. VP is transferred automatically. Rate your partner to build trust.</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Handshake className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 md:block hidden"></div>
                </div>
            </div>

            <div className="text-center mt-16">
                <Link href="/signup">
                    <Button size="lg">Get Started Today <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
            </div>
        </div>
    );
}
