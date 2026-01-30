import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EncryptionService } from '../../security/encryption.service';

@Injectable()
export class PayloadEncryptionMiddleware implements NestMiddleware {
    private readonly logger = new Logger(PayloadEncryptionMiddleware.name);

    constructor(private readonly encryptionService: EncryptionService) { }

    use(req: Request, res: Response, next: NextFunction) {
        // 1. INCOMING DECRYPTION
        if (req.headers['content-type'] === 'application/x-meetbarter-encrypted') {
            try {
                // Expect body to be a raw string or object with 'payload' key
                const encryptedPayload = req.body?.payload || req.body;

                if (typeof encryptedPayload === 'string') {
                    const decryptedJson = this.encryptionService.decrypt(encryptedPayload);
                    req.body = JSON.parse(decryptedJson);
                    this.logger.debug(`🔓 Decrypted payload for ${req.url}`);
                }
            } catch (error) {
                this.logger.error(`Failed to decrypt payload from ${req.ip}: ${error.message}`);
                // If decryption fails, it's likely an attack or garbage data.
                return res.status(400).json({ error: 'Encryption Handshake Failed' });
            }
        }

        // 2. OUTGOING ENCRYPTION (Monkey Patch res.send)
        // Only if client requested encryption or sent encrypted data
        const shouldEncryptResponse = req.headers['x-accept-encryption'] === 'true' ||
            req.headers['content-type'] === 'application/x-meetbarter-encrypted';

        if (shouldEncryptResponse) {
            const originalSend = res.send;

            res.send = (body: any): Response => {
                try {
                    // Start with basic JSON stringify
                    let content = body;
                    if (typeof body === 'object') {
                        content = JSON.stringify(body);
                    }

                    // Encrypt
                    const encrypted = this.encryptionService.encrypt(content);

                    // Restore original send but with encrypted blob
                    // Reset content-type to application/json so client can parse the wrapper
                    res.setHeader('Content-Type', 'application/json');

                    // Send wrapper: { payload: "..." }
                    return originalSend.call(res, JSON.stringify({ payload: encrypted }));
                } catch (error) {
                    this.logger.error(`Failed to encrypt response: ${error.message}`);
                    return originalSend.call(res, body);
                }
            };
        }

        next();
    }
}
