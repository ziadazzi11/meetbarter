'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Building2, Phone, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InstitutionalVerificationPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        registrationNumber: '',
        phoneNumber: '',
        permitType: 'COMMERCIAL',
        issuingAuthority: '',
        evidenceUrl: '',
        evidencePhotoUrl: '',
        issuedAt: '',
        expiresAt: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !token) return;
        setIsLoading(true);

        try {
            const res = await apiClient.fetch(`${API_BASE_URL}/users/${user.id}/submit-license`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    evidence: {
                        links: [formData.evidenceUrl].filter(Boolean),
                        photos: [formData.evidencePhotoUrl].filter(Boolean)
                    }
                })
            });

            if (!res.ok) throw new Error('Failed to submit license');

            toast.success('License submitted successfully! Our compliance team will review it shortly.');
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error('Error submitting license. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="max-w-md w-full mx-4">
                    <CardHeader className="text-center">
                        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                        <CardTitle>Please Sign In</CardTitle>
                        <CardDescription>You need to be logged in to apply for institutional verification.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Link href="/login">
                            <Button>Sign In Now</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-16 px-4">
            <div className="max-w-4xl mx-auto">
                <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors group">
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                <Card className="border-t-4 border-t-primary shadow-2xl">
                    <CardHeader className="bg-primary/5 pb-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Building2 className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-3xl">Institutional Verification</CardTitle>
                                <CardDescription className="text-lg">Level 3: Professional & Business Trust Tier</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Business Details Section */}
                                <div className="space-y-6 md:col-span-2">
                                    <h3 className="text-xl font-semibold flex items-center gap-2 border-b pb-2">
                                        <Shield className="h-5 w-5 text-primary" />
                                        Business Identity
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="businessName">Business Name / Trade Name</Label>
                                            <Input
                                                id="businessName"
                                                name="businessName"
                                                required
                                                className="h-11"
                                                placeholder="e.g. Acme Corporation Ltd."
                                                value={formData.businessName}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="registrationNumber">Registration / Tax ID</Label>
                                            <Input
                                                id="registrationNumber"
                                                name="registrationNumber"
                                                required
                                                className="h-11"
                                                placeholder="e.g. CR-123456"
                                                value={formData.registrationNumber}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                Business Phone Number
                                            </Label>
                                            <Input
                                                id="phoneNumber"
                                                name="phoneNumber"
                                                type="tel"
                                                required
                                                className="h-11"
                                                placeholder="+961 XX XXX XXX"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="permitType">Permit / License Type</Label>
                                            <select
                                                id="permitType"
                                                name="permitType"
                                                title="Select Permit Type"
                                                aria-label="Select Permit Type"
                                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={formData.permitType}
                                                onChange={handleChange}
                                            >
                                                <option value="COMMERCIAL">Commercial Register</option>
                                                <option value="INDUSTRIAL">Industrial Permit</option>
                                                <option value="NON_PROFIT">Non-Profit / NGO</option>
                                                <option value="EDUCATIONAL">Educational License</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Licensing Section */}
                                <div className="space-y-6 md:col-span-2">
                                    <h3 className="text-xl font-semibold flex items-center gap-2 border-b pb-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                        Licensing Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="issuingAuthority">Issuing Authority</Label>
                                            <Input
                                                id="issuingAuthority"
                                                name="issuingAuthority"
                                                required
                                                className="h-11"
                                                placeholder="e.g. Ministry of Economy"
                                                value={formData.issuingAuthority}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="issuedAt">Issue Date</Label>
                                                <Input
                                                    id="issuedAt"
                                                    name="issuedAt"
                                                    type="date"
                                                    required
                                                    className="h-11"
                                                    value={formData.issuedAt}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="expiresAt">Expiry Date</Label>
                                                <Input
                                                    id="expiresAt"
                                                    name="expiresAt"
                                                    type="date"
                                                    required
                                                    className="h-11"
                                                    value={formData.expiresAt}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Evidence Section */}
                                <div className="space-y-6 md:col-span-2">
                                    <h3 className="text-xl font-semibold flex items-center gap-2 border-b pb-2">
                                        <Shield className="h-5 w-5 text-primary" />
                                        Evidence & Scans
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="evidenceUrl">Official Registry Link (Verification URL)</Label>
                                            <Input
                                                id="evidenceUrl"
                                                name="evidenceUrl"
                                                type="url"
                                                className="h-11"
                                                placeholder="https://official-registry.gov/verify/..."
                                                value={formData.evidenceUrl}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="evidencePhotoUrl">Photo of Official Document / Storefront</Label>
                                            <Input
                                                id="evidencePhotoUrl"
                                                name="evidencePhotoUrl"
                                                type="url"
                                                className="h-11"
                                                placeholder="https://uploaded-image-url.com/..."
                                                value={formData.evidencePhotoUrl}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                                <p className="text-sm text-muted-foreground leading-relaxed italic">
                                    "I hereby declare that the information provided is accurate and legitimate. I understand that Meetbarter will verify these details with the relevant authorities."
                                </p>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Link href="/dashboard">
                                    <Button variant="outline" size="lg" type="button" disabled={isLoading}>
                                        Cancel
                                    </Button>
                                </Link>
                                <Button size="lg" className="px-12" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit for Verification"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
