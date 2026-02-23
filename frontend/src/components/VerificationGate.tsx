"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface VerificationGateProps {
    children: ReactNode;
}

export default function VerificationGate({ children }: VerificationGateProps) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Whitelist paths that don't need verification gate
    const isWhitelisted = pathname === "/" || pathname === "/login" || pathname === "/signup" || pathname.startsWith("/verification");

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) return <>{children}</>;

    const status = user?.idCardStatus;
    const needsVerification = !status || status === "NONE" || status === "REJECTED";

    if (needsVerification && !isWhitelisted) {
        return (
            <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <ShieldAlert className="h-10 w-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Identity Verification Required</h1>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    To maintain a safe community and comply with regulations (Whish Money Flow),
                    you must upload a valid ID card before accessing the dashboard or creating listings.
                </p>
                <div className="flex gap-4">
                    <Link href="/verification/id-upload">
                        <Button size="lg" className="bg-red-500 hover:bg-red-600">
                            Upload ID Now
                        </Button>
                    </Link>
                    <Button variant="outline" size="lg" onClick={() => router.push("/")}>
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
