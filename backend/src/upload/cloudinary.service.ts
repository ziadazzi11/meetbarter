import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
}

@Injectable()
export class CloudinaryService {
    private cloudName: string;
    private apiKey: string;
    private apiSecret: string;
    private uploadPreset: string;

    constructor() {
        this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
        this.apiKey = process.env.CLOUDINARY_API_KEY || '';
        this.apiSecret = process.env.CLOUDINARY_API_SECRET || '';
        this.uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'meetbarter_listings';
    }

    /**
     * Upload image to Cloudinary
     * @param file - Buffer or base64 string
     * @param folder - Folder name in Cloudinary (e.g., 'listings', 'profiles')
     */
    async uploadImage(
        file: Buffer | string,
        folder: string = 'listings',
    ): Promise<CloudinaryUploadResponse & { detectedText?: string }> {
        const formData = new FormData();

        // Convert buffer to base64 if needed
        const base64Image = Buffer.isBuffer(file)
            ? `data:image/jpeg;base64,${file.toString('base64')}`
            : file;

        formData.append('file', base64Image);
        formData.append('upload_preset', this.uploadPreset);
        formData.append('folder', folder);

        // Enable OCR
        formData.append('ocr', 'adv_ocr');

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                },
            );

            if (!response.ok) {
                throw new Error(`Cloudinary upload failed: ${response.statusText}`);
            }

            const data = await response.json();

            // Extract text from OCR result
            // Cloudinary returns info.ocr.adv_ocr.data[0].textAnnotations[0].description usually
            let detectedText = '';
            if (data.info && data.info.ocr && data.info.ocr.adv_ocr && data.info.ocr.adv_ocr.data && data.info.ocr.adv_ocr.data.length > 0) {
                detectedText = data.info.ocr.adv_ocr.data[0].textAnnotations?.[0]?.description || '';
            }

            return {
                secure_url: data.secure_url,
                public_id: data.public_id,
                format: data.format,
                width: data.width,
                height: data.height,
                detectedText
            };
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    }

    /**
     * Delete image from Cloudinary
     */
    async deleteImage(publicId: string): Promise<boolean> {
        try {
            const timestamp = Math.round(new Date().getTime() / 1000);
            const signature = this.generateSignature(publicId, timestamp);

            const formData = new FormData();
            formData.append('public_id', publicId);
            formData.append('signature', signature);
            formData.append('api_key', this.apiKey);
            formData.append('timestamp', timestamp.toString());

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
                {
                    method: 'POST',
                    body: formData,
                },
            );

            const data = await response.json();
            return data.result === 'ok';
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            return false;
        }
    }

    /**
     * Generate signature for authenticated requests
     */
    private generateSignature(publicId: string, timestamp: number): string {
        const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${this.apiSecret}`;
        return crypto.createHash('sha1').update(stringToSign).digest('hex');
    }

    /**
     * Get optimized image URL with transformations
     */
    getOptimizedUrl(
        publicId: string,
        width: number = 800,
        quality: number = 80,
    ): string {
        return `https://res.cloudinary.com/${this.cloudName}/image/upload/w_${width},q_${quality},f_auto/${publicId}`;
    }
}
