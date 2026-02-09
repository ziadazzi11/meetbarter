import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import { CloudinaryService } from './cloudinary.service';
import { AutomationService } from '../system-state/automation.service';
import { SecurityService } from '../security/security.service';

@Injectable()
export class SecureUploadService {
    private readonly logger = new Logger(SecureUploadService.name);

    // Whitelisted Magic Bytes (Hex Signatures)
    private readonly ALLOWED_SIGNATURES = {
        'ffd8ffe0': 'image/jpeg',
        'ffd8ffe1': 'image/jpeg',
        '89504e47': 'image/png',
        '25504446': 'application/pdf'
    };

    constructor(
        private cloudinary: CloudinaryService,
        private automation: AutomationService,
        private securityService: SecurityService
    ) { }

    /**
     * The Iron Pipeline: Validate -> Sanitize -> Scan -> Upload
     */
    async processUpload(file: Express.Multer.File, userId: string, folder: string = 'secure_uploads'): Promise<string> {
        this.automation.reportEvent('UPLOAD');

        // 1. Magic Byte Validation (Prevent extension spoofing)
        this.validateMagicBytes(file.buffer);

        // 2. Malware Scan Stub (Future Integration)
        await this.scanForMalware();

        // 3. Sanitization & Re-encoding (Strip Metadata/EXIF)
        const sanitizedBuffer = await this.sanitizeFile(file.buffer, file.mimetype);

        // 4. Secure Storage (Cloudinary as Vault Proxy)
        const uploadResult = await this.cloudinary.uploadImage(sanitizedBuffer, folder);

        // 5. AI Moderation: Check for Phone Numbers
        if (uploadResult.detectedText) {
            const phonePattern = /(?:\d[\s-]*){8,}/; // Simple regex for 8+ digits
            if (phonePattern.test(uploadResult.detectedText)) {
                this.logger.warn(`Phone number detected in image uploaded by user ${userId}. Flagging for review.`);

                // Flag for Admin Review (Human in the Loop)
                await this.securityService.flagContentForReview(
                    userId,
                    'PHONE_NUMBER_IN_IMAGE',
                    uploadResult.secure_url,
                    uploadResult.detectedText
                );

                // We do NOT delete the image yet, so admin can see it in evidence.
                // But we throw error to user so they can't use it.
                // In a real system, we might quarantine this file in Cloudinary.

                throw new BadRequestException('Security Alert: Your image has been flagged for containing personal contact details. An admin will review it shortly. If confirmed, this constitutes a strike against your account.');
            }
        }

        this.logger.log(`Secure upload successful: ${uploadResult.public_id}`);
        return uploadResult.secure_url;
    }

    private validateMagicBytes(buffer: Buffer) {
        const signature = buffer.toString('hex', 0, 4);
        if (!this.ALLOWED_SIGNATURES[signature] && !this.ALLOWED_SIGNATURES[signature.toLowerCase()]) {
            this.logger.warn(`Blocked upload with invalid magic bytes: ${signature}`);
            throw new BadRequestException('Security Violation: File type does not match content.');
        }
    }

    private async sanitizeFile(buffer: Buffer, mimeType: string): Promise<Buffer> {
        // Only process images for now. PDFs are passed through (in a real app, we'd flatten PDFs).
        if (mimeType.startsWith('image/')) {
            // Re-encode to strip all metadata (EXIF, GPS, etc.)
            // We force conversion to WebP or JPEG to kill any embedded scripts in the original container
            return await sharp(buffer)
                .rotate() // Auto-orient based on EXIF before stripping
                .toFormat('jpeg', { quality: 80 }) // Force JPEG re-encoding
                .toBuffer();
        }
        return buffer;
    }

    private async scanForMalware(): Promise<void> {
        // STUB: Integration point for ClamAV or VirusTotal
        const isMalicious = false;
        if (isMalicious) {
            throw new BadRequestException('Security Alert: Malware detected in file.');
        }
    }
}
