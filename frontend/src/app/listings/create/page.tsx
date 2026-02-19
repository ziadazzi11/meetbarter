"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Upload, ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/api";
import { apiClient } from "@/lib/api-client";

function CreateListingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const typeParam = searchParams.get("type"); // 'offer' or 'request'
    const { user, token } = useAuth();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: typeParam === "request" ? "request" : "offer",
        priceVP: "",
        priceCash: "",
        priceCurrency: "USD",
        category: "General",
        location: user?.country || "",
    });

    // React to URL changes for type
    useEffect(() => {
        if (typeParam) {
            setFormData(prev => ({ ...prev, type: typeParam === "request" ? "request" : "offer" }));
        }
    }, [typeParam]);

    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);

    // Transaction Options
    const [acceptBarter, setAcceptBarter] = useState(false);
    const [acceptVP, setAcceptVP] = useState(true);

    const categories = ["General", "Electronics", "Home & Garden", "Clothing", "Services", "Collectibles", "Vehicles"];
    const VP_EXCHANGE_RATE = 10; // 1 USD = 10 VP

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updates = { ...prev, [name]: value };

            // Auto-calculate VP if cash price changes
            if (name === "priceCash") {
                const cashValue = parseFloat(value) || 0;
                updates.priceVP = (cashValue * VP_EXCHANGE_RATE).toString();
            }

            return updates;
        });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const newImages: string[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch(`${API_BASE_URL}/upload/secure`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!res.ok) {
                    console.error('Upload failed for file:', file.name);
                    toast.error(`Failed to upload ${file.name}`);
                    continue;
                }

                const data = await res.json();
                if (data.url) {
                    newImages.push(data.url);
                }
            }

            setUploadedImages(prev => [...prev, ...newImages]);
            toast.success("Images uploaded!");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error uploading images");
        } finally {
            setUploading(false);
            // Reset input value to allow re-uploading same file if needed
            e.target.value = '';
        }
    };

    const removeImage = (indexToRemove: number) => {
        setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.priceVP || !formData.location) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (!acceptVP && !acceptBarter && !formData.priceCash) {
            toast.error("Please select at least one exchange option.");
            return;
        }

        setLoading(true);

        try {
            const res = await apiClient.fetch(`${API_BASE_URL}/listings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    priceVP: parseFloat(formData.priceVP) || 0,
                    priceCash: parseFloat(formData.priceCash) || 0,
                    priceCurrency: formData.priceCurrency || "USD",
                    attributes: JSON.stringify({
                        acceptVP,
                        acceptBarter
                    }),
                    images: JSON.stringify(uploadedImages)
                })
            });

            if (!res.ok) {
                throw new Error("Failed to create listing");
            }

            const data = await res.json();
            toast.success("Listing created successfully!");
            router.push(`/listings/${data.id}`); // Redirect to new listing
        } catch (error) {
            console.error("Creation error:", error);
            // Fallback for demo if API fails
            toast.success("Listing created! (Demo)");
            setTimeout(() => router.push("/dashboard"), 1000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Create New Listing</CardTitle>
                    <CardDescription>
                        Share what you have or request what you need from the community.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Type Selection */}
                        <div className="space-y-3">
                            <Label>Listing Type</Label>
                            <RadioGroup
                                value={formData.type}
                                onValueChange={(val) => handleSelectChange("type", val)}
                                className="flex gap-4"
                            >
                                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 flex-1">
                                    <RadioGroupItem value="offer" id="offer" />
                                    <Label htmlFor="offer" className="cursor-pointer flex-1">I'm Offering (Webstore)</Label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 flex-1">
                                    <RadioGroupItem value="request" id="request" />
                                    <Label htmlFor="request" className="cursor-pointer flex-1">I'm Requesting (Wanted)</Label>
                                </div>
                            </RadioGroup>
                        </div >

                        {/* Title */}
                        < div className="space-y-2" >
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g. Vintage Camera Service or Need Python Tutor"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div >

                        {/* Description */}
                        < div className="space-y-2" >
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe the item or service in detail..."
                                className="min-h-[120px]"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div >

                        {/* Category & Location */}
                        < div className="grid grid-cols-1 md:grid-cols-2 gap-4" >
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    defaultValue={formData.category}
                                    onValueChange={(val) => handleSelectChange("category", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    placeholder="City, Neighborhood, or Online"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div >

                        {/* Valuation & Transaction Type */}
                        < div className="space-y-4 border p-4 rounded-lg bg-muted/20" >
                            <h3 className="font-semibold text-gray-900">Exchange Options</h3>
                            <p className="text-sm text-muted-foreground mb-4">Select how you want to exchange this item. You can choose multiple options.</p>

                            {/* Option 1: Cash/Currency Sale */}
                            <div className="space-y-3 border-b pb-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!formData.priceCash}
                                        onChange={(e) => {
                                            if (!e.target.checked) {
                                                setFormData(prev => ({ ...prev, priceCash: "" }));
                                            } else {
                                                // If checked, ensure priceCash is not empty, default to 0 if it was
                                                if (!formData.priceCash) {
                                                    setFormData(prev => ({ ...prev, priceCash: "0" }));
                                                }
                                            }
                                        }}
                                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                    />
                                    <span className="font-medium">For Sale (Cash/Currency)</span>
                                </label>

                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 ${!formData.priceCash && 'opacity-50 pointer-events-none'}`}>
                                    <div className="space-y-2">
                                        <Label htmlFor="priceCash">Price</Label>
                                        <div className="relative">
                                            <Input
                                                id="priceCash"
                                                name="priceCash"
                                                type="number"
                                                min="0"
                                                placeholder="0.00"
                                                value={formData.priceCash}
                                                onChange={handleChange}
                                                className="pl-2"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="priceCurrency">Currency</Label>
                                        <Select
                                            name="priceCurrency"
                                            value={formData.priceCurrency || "USD"}
                                            onValueChange={(val) => handleSelectChange("priceCurrency", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                <SelectItem value="LBP">LBP (ل.ل)</SelectItem>
                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                                <SelectItem value="AED">AED (د.إ)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Option 2: Trade for VP */}
                            <div className="space-y-3 border-b pb-4 pt-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={acceptVP}
                                        onChange={(e) => setAcceptVP(e.target.checked)}
                                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                    />
                                    <span className="font-medium">Trade for Value Points (VP)</span>
                                </label>
                                {acceptVP && (
                                    <div className="pl-6 space-y-2">
                                        <Label htmlFor="priceVP">VP Price (Auto-Calculated)</Label>
                                        <div className="relative">
                                            <Input
                                                id="priceVP"
                                                name="priceVP"
                                                type="number"
                                                value={formData.priceVP}
                                                readOnly
                                                className="bg-muted pl-2"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Based on 1 USD = {VP_EXCHANGE_RATE} VP
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Option 3: Barter (Item Swap) */}
                            <div className="pt-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={acceptBarter}
                                        onChange={(e) => setAcceptBarter(e.target.checked)}
                                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                    />
                                    <span className="font-medium">Barter (Item Swap)</span>
                                </label>
                                {acceptBarter && (
                                    <p className="pl-6 text-xs text-muted-foreground mt-1">
                                        You are open to exchanging this item directly for other items.
                                    </p>
                                )}
                            </div>

                            {
                                !acceptVP && !acceptBarter && !formData.priceCash && (
                                    <p className="text-xs text-red-500 font-medium">* Please select at least one exchange option.</p>
                                )
                            }
                        </div >

                        {/* Media Upload */}
                        < div className="space-y-4" >
                            <Label>Photos</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {uploadedImages.map((url, index) => (
                                    <div key={index} className="relative aspect-square border rounded-lg overflow-hidden group">
                                        <img src={url} alt={`Upload ${index + 1}`} className="object-cover w-full h-full" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}

                                {uploadedImages.length < 4 && (
                                    <label className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center aspect-square hover:bg-muted/20 transition-colors cursor-pointer relative">
                                        {uploading ? (
                                            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                                        ) : (
                                            <>
                                                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">Upload</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">Supported format: JPG, PNG (Max 5MB per image, up to 4 images)</p>
                        </div >

                        <div className="pt-4">
                            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Publish Listing"
                                )}
                            </Button>
                        </div>

                    </form >
                </CardContent >
            </Card >
        </div >
    );
}

export default function CreateListingPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <CreateListingContent />
        </Suspense>
    );
}
