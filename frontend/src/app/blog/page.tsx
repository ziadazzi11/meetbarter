"use client";

import { BookOpen } from "lucide-react";

export default function BlogPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="flex items-center gap-3 mb-8 justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold">MeetBarter Blog</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Placeholder Blog Posts */}
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-48 bg-muted w-full animate-pulse flex items-center justify-center text-muted-foreground">
                            Article Image Placeholder
                        </div>
                        <div className="p-6">
                            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Community Story</span>
                            <h3 className="text-xl font-bold mt-2 mb-2">How We Built a Local Economy From Scratch</h3>
                            <p className="text-muted-foreground mb-4 line-clamp-2">
                                Read about the journey of our first pilot community and the lessons learned along the way.
                            </p>
                            <span className="text-sm font-medium hover:underline cursor-pointer">Read more →</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
