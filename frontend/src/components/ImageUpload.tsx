'use client';

import { useState } from 'react';

interface ImageUploadProps {
    onUpload: (urls: string[]) => void;
    maxImages?: number;
}

export default function ImageUpload({ onUpload, maxImages = 5 }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [error, setError] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (uploadedImages.length + files.length > maxImages) {
            setError(`Maximum ${maxImages} images allowed`);
            return;
        }

        setUploading(true);
        setError('');

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                // Convert to base64
                const reader = new FileReader();
                return new Promise<string>((resolve, reject) => {
                    reader.onload = async () => {
                        try {
                            const base64 = reader.result as string;

                            // Upload to backend
                            const response = await fetch('/api/upload', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ image: base64 }),
                            });

                            if (!response.ok) throw new Error('Upload failed');

                            const data = await response.json();
                            resolve(data.url);
                        } catch (err) {
                            reject(err);
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            const urls = await Promise.all(uploadPromises);
            const newImages = [...uploadedImages, ...urls];
            setUploadedImages(newImages);
            onUpload(newImages);
        } catch (err) {
            setError('Failed to upload images. Please try again.');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        const newImages = uploadedImages.filter((_, i) => i !== index);
        setUploadedImages(newImages);
        onUpload(newImages);
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Photos (Max {maxImages})
                </label>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={uploading || uploadedImages.length >= maxImages}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    aria-label="Upload listing images"
                />

                {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                )}

                {uploading && (
                    <p className="mt-2 text-sm text-blue-600">Uploading...</p>
                )}
            </div>

            {/* Preview uploaded images */}
            {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    {uploadedImages.map((url, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={url}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-32 object-cover rounded border border-gray-200"
                            />
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
