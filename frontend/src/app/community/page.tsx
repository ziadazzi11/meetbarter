"use client";

import { MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommunityPage() {
    return (
        <div className="container mx-auto py-12 px-4 text-center max-w-2xl">
            <Users className="h-16 w-16 text-primary mx-auto mb-6 opacity-80" />
            <h1 className="text-4xl font-bold mb-4">Community Forum</h1>
            <p className="text-xl text-muted-foreground mb-8">
                Connect with other traders, share tips, and discuss community events.
            </p>
            <div className="p-8 border rounded-lg bg-muted/20">
                <MessageCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">
                    We are building a robust community platform. Stay tuned!
                </p>
            </div>
            <div className="mt-8">
                <Button variant="outline">Join Discord Server</Button>
            </div>
        </div>
    );
}
