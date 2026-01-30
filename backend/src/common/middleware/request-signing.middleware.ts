import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class RequestSigningMiddleware implements NestMiddleware {
    private readonly SIGNING_SECRET = process.env.SIGNING_SECRET || 'meetbarter-institutional-secret-2026';

    use(req: Request, res: Response, next: NextFunction) {
        // Only enforce for sensitive administrative methods
        const sensitivePaths = ['/admin/freeze', '/admin/grant', '/admin/intelligence/snapshot'];
        if (!sensitivePaths.some(path => req.originalUrl.includes(path))) {
            return next();
        }

        const signature = req.headers['x-signature'] as string;
        const timestamp = req.headers['x-timestamp'] as string;

        if (!signature || !timestamp) {
            throw new ForbiddenException('Cryptographic Signature Required for this action.');
        }

        // 1. Replay Attack Protection (5 minute window)
        const now = Date.now();
        const requestTime = parseInt(timestamp, 10);
        if (isNaN(requestTime) || Math.abs(now - requestTime) > 300000) {
            throw new ForbiddenException('Signature Expired (Replay Attack Protection)');
        }

        // 2. Signature Validation
        const payload = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', this.SIGNING_SECRET)
            .update(`${timestamp}.${payload}`)
            .digest('hex');

        if (signature !== expectedSignature) {
            throw new ForbiddenException('Invalid Cryptographic Signature: Payload Mismatch.');
        }

        next();
    }
}
