"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ReportPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-xl">
            <div className="text-center mb-8">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h1 className="text-3xl font-bold">Report an Issue</h1>
                <p className="text-muted-foreground mt-2">
                    Help us keep the community safe. All reports are confidential.
                </p>
            </div>

            <div className="space-y-4 border p-6 rounded-lg bg-card">
                <div className="space-y-2">
                    <label className="text-sm font-medium">What type of issue is this?</label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="spam">Spam or Scam</SelectItem>
                            <SelectItem value="harassment">Harassment or Hate Speech</SelectItem>
                            <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                            <SelectItem value="technical">Technical Bug</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Link to Listing or Profile (optional)</label>
                    <Input placeholder="https://meetbarter.com/..." />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea placeholder="Please describe the issue in detail..." className="min-h-[120px]" />
                </div>

                <Button variant="destructive" className="w-full">Submit Report</Button>
            </div>
        </div>
    );
}
