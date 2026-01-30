import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly key: Buffer; // Master Key (KEK)

    constructor() {
        // In production, this should come from a secure environment variable
        const secret = process.env.VAULT_ENCRYPTION_KEY || 'a-very-secure-placeholder-key-32-chars!!';
        this.key = crypto.scryptSync(secret, 'salt', 32);
    }

    /**
     * Legacy Encryption (v1) - Single Key
     * @deprecated Use encryptEnvelope for new data
     */
    encrypt(text: string): string {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag().toString('hex');

        // Format: iv:authTag:encrypted
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    }

    /**
     * Envelope Encryption (v2) - Unique Data Key per Object
     * Format: v2:encryptedDEK:iv:authTag:encryptedContent
     */
    encryptEnvelope(text: string): string {
        // 1. Generate a unique Data Encryption Key (DEK) for this specific object
        const dek = crypto.randomBytes(32);

        // 2. Encrypt the Content using the DEK
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(this.algorithm, dek, iv);
        let encryptedContent = cipher.update(text, 'utf8', 'hex');
        encryptedContent += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');

        // 3. Encrypt the DEK using the Master Key (KEK)
        // We use a separate IV for the DEK encryption to be safe
        const dekIv = crypto.randomBytes(12);
        const dekCipher = crypto.createCipheriv(this.algorithm, this.key, dekIv);
        let encryptedDek = dekCipher.update(dek.toString('hex'), 'utf8', 'hex'); // Encrypt hex representation of DEK
        encryptedDek += dekCipher.final('hex');
        const dekAuthTag = dekCipher.getAuthTag().toString('hex');

        // Pack the Encrypted DEK: iv:authTag:content
        const packedEncryptedDek = `${dekIv.toString('hex')}:${dekAuthTag}:${encryptedDek}`;

        // 4. Return the Envelope
        return `v2:${packedEncryptedDek}:${iv.toString('hex')}:${authTag}:${encryptedContent}`;
    }

    decrypt(encryptedData: string): string {
        // Check for v2 Envelope Header
        if (encryptedData.startsWith('v2:')) {
            return this.decryptEnvelope(encryptedData);
        }

        // Fallback to v1 Legacy Decryption
        return this.decryptLegacy(encryptedData);
    }

    private decryptLegacy(encryptedData: string): string {
        const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');

        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    private decryptEnvelope(envelope: string): string {
        // Format: v2:packedEncryptedDek:iv:authTag:encryptedContent
        const parts = envelope.split(':');

        // v2 is parts[0]
        // packedEncryptedDek is parts[1]:parts[2]:parts[3] (iv:tag:content)
        // content params are parts[4], parts[5], parts[6]

        // Structure: v2 : dekIv : dekTag : encryptedDek : contentIv : contentTag : encryptedContent

        const [
            version,
            dekIvHex, dekTagHex, encryptedDekHex,
            contentIvHex, contentTagHex, encryptedContentHex
        ] = parts;

        if (version !== 'v2') throw new Error('Invalid encryption version');

        // 1. Decrypt the DEK using Master Key
        const dekIv = Buffer.from(dekIvHex, 'hex');
        const dekTag = Buffer.from(dekTagHex, 'hex');
        const dekDecipher = crypto.createDecipheriv(this.algorithm, this.key, dekIv);
        dekDecipher.setAuthTag(dekTag);
        let dekHex = dekDecipher.update(encryptedDekHex, 'hex', 'utf8');
        dekHex += dekDecipher.final('utf8');
        const dek = Buffer.from(dekHex, 'hex');

        // 2. Decrypt Content using DEK
        const contentIv = Buffer.from(contentIvHex, 'hex');
        const contentTag = Buffer.from(contentTagHex, 'hex');
        const contentDecipher = crypto.createDecipheriv(this.algorithm, dek, contentIv);
        contentDecipher.setAuthTag(contentTag);
        let decrypted = contentDecipher.update(encryptedContentHex, 'hex', 'utf8');
        decrypted += contentDecipher.final('utf8');

        return decrypted;
    }
}
