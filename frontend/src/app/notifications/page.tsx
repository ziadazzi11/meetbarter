"use client";

import { Bell } from "lucide-react";

export default function NotificationsPage() {
    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Bell className="h-8 w-8" />
                Notifications
            </h1>

            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/10 h-[400px]">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No notifications yet</h3>
                <p className="text-muted-foreground mt-1 max-w-sm">
                    When you get trade offers or updates, they will appear here.
                </p>
            </div>
        </div>
    );
}
