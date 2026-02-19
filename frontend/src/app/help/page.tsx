"use client";

import { Search, HelpCircle, FileText, Settings, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-5xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
                <div className="max-w-xl mx-auto relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input className="pl-10 h-12" placeholder="Search articles..." />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader>
                        <FileText className="h-8 w-8 text-primary mb-2" />
                        <CardTitle>Getting Started</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Account creation, profile setup, and your first trade.</p>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader>
                        <Settings className="h-8 w-8 text-primary mb-2" />
                        <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Manage notifications, password, and preferences.</p>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader>
                        <Shield className="h-8 w-8 text-primary mb-2" />
                        <CardTitle>Trust & Safety</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Verification badges, reporting users, and safe trading tips.</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
                <ul className="space-y-4">
                    {["How to verify my phone number", "Understanding Value Points", "Dispute resolution process", "Editing a listing"].map((article, i) => (
                        <li key={i} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                            <HelpCircle className="h-5 w-5 text-muted-foreground" />
                            <span>{article}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
