import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SecurityService } from '../security/security.service';
import { AnomalyDetectionService } from '../security/anomaly-detection.service';
import { SignalIngestionService } from '../ads/signal-ingestion.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private security: SecurityService,
        private anomalyDetection: AnomalyDetectionService,
        private ads: SignalIngestionService, // Replaces AutomationService
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { passwordHash: _, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any, ip?: string) {
        const riskScore = ip ? await this.anomalyDetection.evaluateRisk(user.id, ip) : 0;

        await this.security.assessAndLog(user.id, {
            action: 'LOGIN_ATTEMPT',
            userId: user.id,
            details: { email: user.email, role: user.role, ip, riskScore }
        });

        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = crypto.randomUUID();

        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        await (this.prisma.user as any).update({
            where: { id: user.id },
            data: { refreshTokenHash }
        });

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        };
    }

    async refresh(userId: string, refreshToken: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } }) as any;
        if (!user || !user.refreshTokenHash) throw new UnauthorizedException('Invalid Session');

        const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!isMatch) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { refreshTokenHash: null }
            });
            throw new UnauthorizedException('Session Compromised: Rotation Failure detected.');
        }

        return this.login(user);
    }

    async updateMfa(userId: string, data: { mfaSecret?: string, mfaEnabled?: boolean }) {
        return this.prisma.user.update({
            where: { id: userId },
            data
        });
    }

    async register(data: any) {
        // 📡 ADS SIGNAL: Signup Attempt
        this.ads.emitSignal({
            type: 'AUTH_ATTEMPT',
            source: data.email, // Or request IP if available
            timestamp: Date.now(),
            metadata: {
                success: true, // Optimistic, failure handled by exception
                isNewDevice: true // Simplification
            }
        });

        const hashedPassword = await bcrypt.hash(data.password, 10);

        // ... existing code ...

        // 🛡️ Security Hook: Pre-Signup Risk Check (e.g. limit signups from same IP)
        // We don't have a userId yet, so we might pass a temporary identifier or IP if available in context.
        // For now, we log AFTER creation which is safer for ID tracking.

        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                passwordHash: hashedPassword,
                fullName: data.fullName,
                country: data.country || 'Lebanon'
            }
        });

        // 🛡️ Security Hook: Signup Event
        await this.security.assessAndLog(user.id, {
            action: 'SIGNUP_ATTEMPT',
            userId: user.id,
            details: { email: data.email, country: data.country }
        });

        const result = { ...user };
        delete (result as any).passwordHash;
        return result;
    }
}
