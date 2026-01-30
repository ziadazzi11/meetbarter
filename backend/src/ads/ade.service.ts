import { Injectable, Logger } from '@nestjs/common';
import { SystemStateService } from '../system-state/system-state.service';
import { RiskProfile } from './risk-engine.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdeService {
    private readonly logger = new Logger(AdeService.name);

    constructor(
        private readonly systemState: SystemStateService,
        private readonly prisma: PrismaService
    ) { }

    async decideAndAct(source: string, profile: RiskProfile) {
        if (profile.score < 30) return; // Low Risk - No Action

        // LEVEL 1: COGNITIVE FRICTION (30-60)
        // Handled by ThrottleInterceptor

        // LEVEL 2: SHADOWBAN / ISOLATION (60-85)
        if (profile.score >= 60 && profile.score < 85) {
            this.logger.warn(`ADS: 🔇 Applying SHADOWBAN to ${source} [Score: ${profile.score}]`);

            // Check if user exists (source might be IP, but here we assume Email/ID for non-IP signals)
            // Ideally we resolve UserID from Source earlier.
            // For now, try to find user by Email or ID (naive implementation)
            const user = await this.resolveUser(source);
            if (user) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        isShadowbanned: true,
                        shadowbanReason: `ADS_AUTO_ACTION: Risk Score ${profile.score} - ${profile.factors.join(',')}`
                    }
                });
            }
        }

        // LEVEL 3: NUCLEAR CONTAINMENT (85+)
        if (profile.score >= 85) {
            this.logger.error(`ADS: 🚨 DEFCON 1 for ${source} [Score: ${profile.score}]`);

            // 1. FREEZE ACCOUNT
            const user = await this.resolveUser(source);
            if (user) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        isBanned: true,
                        banReason: `ADS_AUTO_BAN: CRITICAL THREAT - ${profile.factors.join(',')}`,
                        bannedAt: new Date()
                    }
                });
            }

            // 2. SYSTEM WIDE FREEZE IF MASSIVE THREAT
            if (profile.score >= 95) {
                this.logger.error('ADE: ☢️ SYSTEM THREAT LEVEL CRITICAL. SETTING SAFE MODE.');
                this.systemState.setMode('SAFE');
            }
        }
    }

    private async resolveUser(source: string) {
        // Try simple email or ID match. 
        // In real system, SignalIngestion provides 'entityType' and 'entityId' metadata.
        // Assuming source is likely an email or ID for high fidelity signals.
        let user = await this.prisma.user.findUnique({ where: { email: source } });
        if (!user) {
            user = await this.prisma.user.findUnique({ where: { id: source } });
        }
        return user;
    }
}
