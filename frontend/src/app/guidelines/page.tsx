"use client";

import { CheckCircle } from "lucide-react";

export default function GuidelinesPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="mb-8 flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Community Guidelines</h1>
            </div>
            <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg mb-6">To maintain a safe and trusted community, we ask all members to follow these guidelines.</p>

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="p-6 border rounded-lg bg-card">
                        <h3 className="font-bold text-xl mb-2 text-green-500">Do's</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Be respectful and kind to other members.</li>
                            <li>Communicate clearly about your offers and requests.</li>
                            <li>Honor your trade agreements.</li>
                            <li>Report suspicious activity.</li>
                        </ul>
                    </div>

                    <div className="p-6 border rounded-lg bg-card">
                        <h3 className="font-bold text-xl mb-2 text-red-500">Don'ts</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Harass or discriminate against others.</li>
                            <li>Post illegal or prohibited items.</li>
                            <li>Spam the platform with duplicate listings.</li>
                            <li>Request trades outside of the designated VP system to avoid fees.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
