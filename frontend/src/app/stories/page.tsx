"use client";

import { Trophy, Star } from "lucide-react";

export default function StoriesPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="text-center mb-12">
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-4">Success Stories</h1>
                <p className="text-xl text-muted-foreground">Real people, real trades, real value.</p>
            </div>

            <div className="space-y-8">
                <div className="bg-card border rounded-lg p-8 flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-24 h-24 rounded-full bg-muted shrink-0"></div>
                    <div>
                        <div className="flex text-yellow-400 mb-2">
                            <Star className="h-4 w-4 fill-current" />
                            <Star className="h-4 w-4 fill-current" />
                            <Star className="h-4 w-4 fill-current" />
                            <Star className="h-4 w-4 fill-current" />
                            <Star className="h-4 w-4 fill-current" />
                        </div>
                        <p className="text-lg italic mb-4">"I traded my old guitar for web design lessons. Now I have a portfolio site and a new skill!"</p>
                        <p className="font-bold">- Alex M., Graphic Designer</p>
                    </div>
                </div>
                <div className="bg-card border rounded-lg p-8 flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-24 h-24 rounded-full bg-muted shrink-0"></div>
                    <div>
                        <div className="flex text-yellow-400 mb-2">
                            <Star className="h-4 w-4 fill-current" />
                            <Star className="h-4 w-4 fill-current" />
                            <Star className="h-4 w-4 fill-current" />
                            <Star className="h-4 w-4 fill-current" />
                            <Star className="h-4 w-4 fill-current" />
                        </div>
                        <p className="text-lg italic mb-4">"Found someone to help me move in exchange for homemade meals for a week. The best trade I've ever made."</p>
                        <p className="font-bold">- Sarah J., Student</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
