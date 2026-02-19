"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MessagesPage() {
    return (
        <div className="container mx-auto py-8 max-w-6xl h-[calc(100vh-100px)]">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="h-8 w-8" />
                Messages
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[600px]">
                {/* Contact List */}
                <div className="md:col-span-1 border rounded-lg p-4 space-y-4 overflow-y-auto">
                    <h2 className="font-semibold text-lg">Conversations</h2>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground text-center py-8">No conversations</p>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="md:col-span-3 border rounded-lg flex flex-col items-center justify-center text-center p-8 text-muted-foreground bg-muted/5">
                    <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="h-8 w-8 opacity-50" />
                    </div>
                    <h3 className="text-lg font-medium">No messages selected</h3>
                    <p className="max-w-xs mt-2">Select a conversation from the list to start messaging.</p>
                </div>
            </div>
        </div>
    );
}
