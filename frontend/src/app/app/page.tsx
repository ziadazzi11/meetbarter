"use client";

import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MobileAppPage() {
    return (
        <div className="container mx-auto py-24 px-4 text-center">
            <Smartphone className="h-24 w-24 text-primary mx-auto mb-6 opacity-80" />
            <h1 className="text-4xl font-bold mb-4">MeetBarter Mobile App</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Trade on the go! Our mobile app is currently in development and will be available on iOS and Android soon.
            </p>
            <div className="flex gap-4 justify-center">
                <Button disabled variant="outline">Download for iOS</Button>
                <Button disabled variant="outline">Download for Android</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Join the waitlist to be notified when we launch.</p>
        </div>
    );
}
