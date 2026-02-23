'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Building2, Phone, FileText, ArrowLeft, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from "@/components/ImageUpload";

export default function BusinessLicenseSubmission() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        registrationNumber: '',
        phoneNumber: '',
        permitType: 'Physical Goods',
        issuingAuthority: '',
        issuedAt: '',
        expiresAt: ''
    });
    const [links, setLinks] = useState<string[]>(['']);
    const [photos, setPhotos] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddLink = () => setLinks([...links, '']);
    const handleLinkChange = (index: number, val: string) => {
        const newLinks = [...links];
        newLinks[index] = val;
        setLinks(newLinks);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !token) {
            toast.error('Session expired. Please login again.');
            return;
        }
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
                        links: links.filter(l => l.trim() !== ""),
                        photos
                    }
                })
            });

            if (!res.ok) throw new Error('Failed to submit license');

            toast.success('Institutional Permit Submitted! Review usually takes 48 hours.');
            router.push('/profile');
        } catch (error) {
            console.error(error);
            toast.error('Submission failed. Please check your data or try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="max-w-md w-full mx-4">
                    <CardHeader className="text-center">
                        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                        <CardTitle>Authentication Required</CardTitle>
                        <CardDescription>You must be signed in to access business verification.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Link href="/login">
                            <Button className="bg-blue-600 hover:bg-blue-700">Sign In</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 py-16 px-4">
            <div className="max-w-3xl mx-auto">
                <Link href="/profile" className="flex items-center text-muted-foreground hover:text-blue-600 mb-8 transition-colors group">
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Profile
                </Link>

                <Card className="border-none shadow-xl">
                    <CardHeader className="bg-blue-600 text-white rounded-t-lg pb-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Building2 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-3xl font-bold">Business Onboarding</CardTitle>
                                <CardDescription className="text-blue-100 text-lg">Official Association Verification Protocol</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="registrationNumber">Commercial Register / Tax ID</Label>
                                    <Input
                                        id="registrationNumber"
                                        name="registrationNumber"
                                        required
                                        className="h-12 border-slate-200 focus:ring-blue-500"
                                        placeholder="e.g. 12345/B"
                                        value={formData.registrationNumber}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="permitType">Permit Category</Label>
                                    <select
                                        id="permitType"
                                        name="permitType"
                                        title="Select Permit Category"
                                        aria-label="Select Permit Category"
                                        className="flex h-12 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                        value={formData.permitType}
                                        onChange={handleChange}
                                    >
                                        <option>Physical Goods</option>
                                        <option>Logistics & Transport</option>
                                        <option>Food & Health</option>
                                        <option>Professional Services</option>
                                        <option>Manufacturing</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="phoneNumber">Official Business Phone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            type="tel"
                                            required
                                            className="h-12 pl-12 border-slate-200 focus:ring-blue-500"
                                            placeholder="+961 XX XXX XXX"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="issuingAuthority">Issuing Authority</Label>
                                    <Input
                                        id="issuingAuthority"
                                        name="issuingAuthority"
                                        required
                                        className="h-12 border-slate-200 focus:ring-blue-500"
                                        placeholder="e.g. Ministry of Industry"
                                        value={formData.issuingAuthority}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="issuedAt">Issue Date</Label>
                                    <Input
                                        id="issuedAt"
                                        name="issuedAt"
                                        type="date"
                                        required
                                        className="h-12 border-slate-200"
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
                                        className="h-12 border-slate-200"
                                        value={formData.expiresAt}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Verification Links */}
                            <div className="space-y-4">
                                <Label className="text-base font-bold text-slate-900">Verification Links</Label>
                                <div className="space-y-3">
                                    {links.map((link, idx) => (
                                        <Input
                                            key={idx}
                                            type="url"
                                            className="h-12 border-slate-200"
                                            placeholder="https://official-registry.gov/verify/..."
                                            value={link}
                                            onChange={(e) => handleLinkChange(idx, e.target.value)}
                                        />
                                    ))}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleAddLink}
                                        className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                                    >
                                        + Add Another Link
                                    </Button>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-4">
                                <Label className="text-base font-bold text-slate-900">Evidence Photos (Official Scans)</Label>
                                <div className="bg-slate-50 p-6 rounded-xl border-2 border-dashed border-slate-200">
                                    <ImageUpload initialImages={photos} onUpload={setPhotos} maxImages={5} />
                                    <p className="text-xs text-slate-500 mt-4 flex items-center gap-2">
                                        <Shield className="h-3 w-3" />
                                        Upload clear photos of commercial register and tax permits.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                                <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    <strong>Institutional Shield:</strong> By submitting, you authorize Meetbarter to verify these details. False information will lead to permanent account suspension.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all rounded-xl"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Processing Protocol...
                                    </>
                                ) : (
                                    "Submit for Verification"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
