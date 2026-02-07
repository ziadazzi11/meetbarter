import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
    constructor(private prisma: PrismaService) { }

    async generateOtp(phoneNumber: string): Promise<string> {
        // Generate 6-digit code
        const code = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store in DB (upsert to replace existing code for this number)
        await this.prisma.otpCode.upsert({
            where: { phoneNumber },
            update: { code, expiresAt, createdAt: new Date() },
            create: { phoneNumber, code, expiresAt }
        });

        // In production, send via SMS (Twilio, etc.)
        // For now, log it for development
        console.log(`[OTP-SERVICE] Generated OTP for ${phoneNumber}: ${code}`);

        return code;
    }

    async verifyOtp(phoneNumber: string, code: string): Promise<boolean> {
        const record = await this.prisma.otpCode.findUnique({
            where: { phoneNumber }
        });

        if (!record) {
            throw new BadRequestException('No OTP request found for this number');
        }

        if (record.code !== code) {
            throw new BadRequestException('Invalid OTP code');
        }

        if (new Date() > record.expiresAt) {
            throw new BadRequestException('OTP code has expired');
        }

        // Consume OTP
        await this.prisma.otpCode.delete({ where: { phoneNumber } });

        return true;
    }
}
