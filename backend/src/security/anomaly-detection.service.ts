import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnomalyDetectionService {
    private readonly logger = new Logger(AnomalyDetectionService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Layer VIII: Neural Behavioral Profiling
     * Evaluates the risk score for a user based on IP shifts and velocity.
     */
    async evaluateRisk(userId: string, currentIp: string): Promise<number> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) return 0;

        let riskScore = 0;

        // 1. IP Shift Detection (Geo-Velocity Proxy)
        if (user.lastIp && user.lastIp !== currentIp) {
            riskScore += 30; // Sudden shift in network location
            this.logger.warn(`Anomaly Detected: IP Shift for User ${userId} [${user.lastIp} -> ${currentIp}]`);
        }

        // 2. Behavioral Velocity (Wait for interaction logs if needed)
        // For now, we update the user's records
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                lastIp: currentIp,
                riskScore: Math.min(riskScore, 100)
            }
        });

        return riskScore;
    }

    /**
     * Returns true if the user's risk profile requires "Friction" (MFA).
     */
    shouldApplyFriction(riskScore: number): boolean {
        return riskScore >= 50;
    }
}
