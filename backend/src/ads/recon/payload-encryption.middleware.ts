import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EncryptionService } from '../../security/encryption.service';

@Injectable()
export class PayloadEncryptionMiddleware implements NestMiddleware {
    private readonly logger = new Logger(PayloadEncryptionMiddleware.name);

    constructor(private readonly encryptionService: EncryptionService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const isEncryptedRequest = req.headers['content-type'] === 'application/x-meetbarter-encrypted';
        const wantsEncryptedResponse = req.headers['x-accept-encryption'] === 'true';

        // 1. INCOMING DECRYPTION (Only if explicitly flagged)
        if (isEncryptedRequest) {
            try {
                const encryptedPayload = req.body?.payload || req.body;

                if (typeof encryptedPayload === 'string') {
                    const decryptedJson = this.encryptionService.decrypt(encryptedPayload);
                    req.body = JSON.parse(decryptedJson);
                    this.logger.debug(`🔓 Decrypted opt-in payload for ${req.url}`);
                }
            } catch (error) {
                this.logger.error(`Decryption failed for ${req.ip}: ${error.message}`);
                return res.status(400).json({ error: 'Encryption Handshake Failed' });
            }
        }

        // 2. OUTGOING ENCRYPTION (Only if explicitly requested)
        if (isEncryptedRequest || wantsEncryptedResponse) {
            const originalSend = res.send;

            res.send = (body: any): Response => {
                try {
                    let content = body;
                    if (typeof body === 'object') {
                        content = JSON.stringify(body);
                    }

                    const encrypted = this.encryptionService.encrypt(content);
                    res.setHeader('Content-Type', 'application/json');
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
