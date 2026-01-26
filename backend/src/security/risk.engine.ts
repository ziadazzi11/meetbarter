
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiskAssessment, RiskLevel } from './security.types';
import { VelocityGuard } from './velocity.guard';

@Injectable()
export class RiskEngine {
    constructor(
        private prisma: PrismaService,
        private velocityGuard: VelocityGuard
    ) { }

    /**
     * The "Brain". Calculates a 0-100 Risk Score.
     */
    async evaluate(userId: string, actionContext: any): Promise<RiskAssessment> {
        let score = 0;
        const factors: string[] = [];

        // Factor 1: Baseline Trust (Inverse Risk)
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user) {
            if (user.globalTrustScore > 50) score -= 10; // Trusted user
            if (user.isBusiness) score -= 5; // Verified business

            // Factor 2: Account Age (New accounts are riskier)
            const daysSinceJoin = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceJoin < 1) {
                score += 20;
                factors.push('NEW_ACCOUNT');
            }
        }

        // Factor 3: Velocity Check (REAL)
        const currentVelocity = this.velocityGuard.check(userId);

        if (currentVelocity > 10) {
            score += 40;
            factors.push('HIGH_VELOCITY');
        }

        // Factor 4: Sensitive Actions
        if (['DELETE_ACCOUNT', 'TRANSFER_ALL_FUNDS', 'CHANGE_PASSWORD'].includes(actionContext.action)) {
            score += 30;
            factors.push('SENSITIVE_ACTION');
        }

        // Normalize
        score = Math.max(0, Math.min(100, score));

        return {
            score,
            level: this.mapScoreToLevel(score),
            factors
        };
    }

    private mapScoreToLevel(score: number): RiskLevel {
        if (score >= 90) return RiskLevel.LOCKDOWN;
        if (score >= 70) return RiskLevel.RESTRICT;
        if (score >= 50) return RiskLevel.FRICTION;
        if (score >= 31) return RiskLevel.MONITOR;
        return RiskLevel.NORMAL;
    }
}
