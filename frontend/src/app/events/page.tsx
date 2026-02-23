"use client";

import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EventsPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="text-center mb-12">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-4">Community Events</h1>
                <p className="text-xl text-muted-foreground">Meet local traders, learn new skills, and build connections.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-muted w-full flex items-center justify-center text-muted-foreground">
                        Event Image Placeholder
                    </div>
                    <div className="p-6">
                        <div className="text-sm font-semibold text-primary mb-2">UPCOMING • SAT, AUG 12</div>
                        <h3 className="text-2xl font-bold mb-2">Local Swap Meet & Workshop</h3>
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                            <MapPin className="h-4 w-4" />
                            <span>City Community Center</span>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            Bring your items to trade in person! Plus, a free workshop on repairing electronics.
                        </p>
                        <Button className="w-full">RSVP</Button>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center p-8 bg-muted/20 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Host Your Own Event</h3>
                <p className="text-muted-foreground mb-6">Want to organize a MeetBarter gathering in your neighborhood?</p>
                <Button variant="outline">Apply to Host</Button>
            </div>
        </div>
    );
}
