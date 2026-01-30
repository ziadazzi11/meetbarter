import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class SearchSecurityService {
    /**
     * Strictly validate and sanitize search input to prevent injection and PII leakage.
     */
    validateAndSanitize(query: string): string {
        if (!query) return '';

        // 1. Length Validation (Avoid DoS and payload injection)
        if (query.length > 100) {
            throw new BadRequestException('Query exceeds maximum allowed length.');
        }

        // 2. Normalization (Handle Unicode variants/obfuscation)
        let normalized = query.normalize('NFKC').trim();

        // 3. Sanitization (Strip HTML and dangerous sequences)
        normalized = normalized.replace(/<[^>]*>?/gm, ''); // Strip HTML
        normalized = normalized.replace(/['";\\=]/g, '');   // Prevent escape sequence abuse

        // 4. White-listing (Allow only characters that make sense for search)
        // Allowed: Alphanumeric, spaces, basic punctuation (?), and regional chars
        const whiteListRegex = /^[a-zA-Z0-9\s?.,!%@()\-_\u00C0-\u017F]+$/;
        if (!whiteListRegex.test(normalized)) {
            // Instead of throwing, we strip non-whitelisted characters for a better UX
            normalized = normalized.replace(/[^a-zA-Z0-9\s?.,!%@()\-_\u00C0-\u017F]/g, '');
        }

        return normalized.toLowerCase();
    }

    /**
     * Logic to detect if a query contains PII patterns (Optional but recommended)
     */
    containsPII(query: string): boolean {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const phoneRegex = /\+?[0-9]{7,15}/; // Simple global phone check
        return emailRegex.test(query) || phoneRegex.test(query);
    }
}
