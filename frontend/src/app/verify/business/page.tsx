"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import { API_BASE_URL } from "@/config/api";

export default function BusinessLicenseSubmission() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        registrationNumber: "",
        permitType: "Physical Goods",
        issuingAuthority: "",
        issuedAt: "",
        expiresAt: ""
    });
    const [links, setLinks] = useState<string[]>([""]);
    const [photos, setPhotos] = useState<string[]>([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/users/me`)
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setLoading(false);
            });
    }, []);

    const handleAddLink = () => setLinks([...links, ""]);
    const handleLinkChange = (index: number, val: string) => {
        const newLinks = [...links];
        newLinks[index] = val;
        setLinks(newLinks);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            ...formData,
            evidence: {
                links: links.filter(l => l.trim() !== ""),
                photos
            }
        };

        try {
            const res = await fetch(`${API_BASE_URL}/users/${user.id}/submit-license`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Institutional Permit Submitted for Review! Our administration will verify the documents within 48 hours.");
                router.push("/profile");
            } else {
                alert("Submission failed. Please check your data.");
            }
        } catch (err) {
            alert("An error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-20 text-center">Loading Institutional Protocol...</div>;

    return (
        <div className="min-h-screen bg-white text-gray-900 p-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 border-b pb-6">
                    <h1 className="text-3xl font-bold tracking-tight">🏛️ Institutional Business Onboarding</h1>
                    <p className="text-gray-500 mt-2">Submit your commercial permits for official Association verification and the &quot;Institutional Partner&quot; badge.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Commercial Register / Tax ID</label>
                            <input
                                required
                                type="text"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. 12345/B"
                                value={formData.registrationNumber}
                                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Permit Type</label>
                            <select
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.permitType}
                                onChange={(e) => setFormData({ ...formData, permitType: e.target.value })}
                            >
                                <option>Physical Goods</option>
                                <option>Logistics & Transport</option>
                                <option>Food & Health</option>
                                <option>Professional Services</option>
                                <option>Manufacturing</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Issuing Authority</label>
                            <input
                                required
                                type="text"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Ministry of Industry, Chamber of Commerce"
                                value={formData.issuingAuthority}
                                onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Issue Date</label>
                            <input
                                required
                                type="date"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.issuedAt}
                                onChange={(e) => setFormData({ ...formData, issuedAt: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
                            <input
                                required
                                type="date"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.expiresAt}
                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                            />
                        </div>

                        {/* Multi-Link Section */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Verification Links</label>
                            <div className="space-y-3">
                                {links.map((link, idx) => (
                                    <input
                                        key={idx}
                                        type="url"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="https://official-registry.gov/verify/123"
                                        value={link}
                                        onChange={(e) => handleLinkChange(idx, e.target.value)}
                                    />
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddLink}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    + Add Another Link
                                </button>
                            </div>
                        </div>

                        {/* Photo Evidence Section */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Evidence Photos (Official Scans)</label>
                            <ImageUpload initialImages={photos} onUpload={setPhotos} maxImages={5} />
                            <p className="text-[10px] text-gray-400 mt-2 italic">Please upload clear photos of your commercial register, tax cards, and relevant professional permits.</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-700 leading-relaxed">
                            <strong>Institutional Shield:</strong> By submitting these documents, you authorize the Association to verify their legitimacy with the relevant authorities. This permit must be renewed annually to maintain your &quot;Institutional Partner&quot; status.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.01] active:scale-95'}`}
                    >
                        {submitting ? "Processing Institutional Onboarding..." : "Submit Permit for Verification"}
                    </button>
                </form>
            </div>
        </div>
    );
}
