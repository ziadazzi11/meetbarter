'use client';

import { useState } from 'react';

interface ImageUploadProps {
    onUpload: (urls: string[]) => void;
    maxImages?: number;
    initialImages?: string[];
}

export default function ImageUpload({ onUpload, maxImages = 5, initialImages = [] }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    // We don't maintain local state for images effectively if we want parent control, 
    // but for preview we can use initialImages if passed or just trust parent updates.
    // However, to make it simple, let's assume we trigger onUpload and let parent manage state, 
    // but we can show "Processing..." state locally.

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (initialImages.length + files.length > maxImages) {
            setError(`Maximum ${maxImages} images allowed`);
            return;
        }

        setUploading(true);
        setError('');

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                // Resize and Convert to base64
                // We use a simple resizing to avoid huge payloads for SQLite/Base64
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 800; // Limit width
                            const MAX_HEIGHT = 800;
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                                if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                }
                            } else {
                                if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);

                            // Compress
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                            resolve(dataUrl);
                        };
                        img.src = event.target?.result as string;
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            const newBase64Images = await Promise.all(uploadPromises);

            // Pass ALL images (old + new) to parent
            onUpload([...initialImages, ...newBase64Images]);
        } catch (err) {
            setError('Failed to process images. Please try again.');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Photos (Max {maxImages})
                </label>

                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">JPG, PNG (Max 800x800px resized)</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} disabled={uploading || initialImages.length >= maxImages} />
                    </label>
                </div>

                {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                )}

                {uploading && (
                    <p className="mt-2 text-sm text-blue-600">Processing images...</p>
                )}
            </div>

            {/* Preview is handled by parent usually, but we can show active state if needed, though parent likely renders the list. */}
        </div>
    );
}
