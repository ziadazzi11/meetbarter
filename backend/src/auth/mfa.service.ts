import { Injectable, Logger } from '@nestjs/common';
import * as qrcode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

// Pragmatic fix for otplib import issues in varying TS environments
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { authenticator } = require('otplib');

@Injectable()
export class MfaService {
    private readonly logger = new Logger(MfaService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Generates a new TOTP secret for a user.
     */
    generateSecret() {
        return authenticator.generateSecret();
    }

    /**
     * Generates a QR Code URL for the user to scan.
     */
    async generateQrCode(email: string, secret: string) {
        const otpauth = authenticator.keyuri(email, 'Meetbarter', secret);
        return qrcode.toDataURL(otpauth);
    }

    /**
     * Verifies a TOTP token against a secret.
     */
    verifyToken(token: string, secret: string): boolean {
        try {
            return authenticator.verify({ token, secret });
        } catch (error) {
            this.logger.error(`MFA Verification Error: ${error.message}`);
            return false;
        }
    }
}
