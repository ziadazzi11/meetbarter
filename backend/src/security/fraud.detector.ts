
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FraudDetector {
    constructor(private prisma: PrismaService) { }

    /**
     * Detects circular trading or "farming" patterns.
     * e.g., User A -> User B -> User A (farming reputation)
     */
    async detectCollusion(userA: string, userB: string): Promise<boolean> {
        // 1. Get completion history between these two
        const history = await this.prisma.trade.count({
            where: {
                OR: [
                    { buyerId: userA, sellerId: userB },
                    { buyerId: userB, sellerId: userA }
                ],
                status: 'COMPLETED'
            }
        });

        // 2. Simple Heuristic: If they have traded > 5 times, it's suspicious for a MVP
        if (history > 5) {
            return true;
        }

        return false;
    }

    /**
     * Detects rapid creation of listings or trades.
     */
    async checkVelocity(userId: string, type: 'LISTING' | 'TRADE'): Promise<number> {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        if (type === 'LISTING') {
            return this.prisma.listing.count({
                where: { sellerId: userId, createdAt: { gte: fiveMinutesAgo } }
            });
        }

        // Trade Velocity Check
        return this.prisma.trade.count({
            where: {
                OR: [{ buyerId: userId }, { sellerId: userId }],
                createdAt: { gte: fiveMinutesAgo }
            }
        });
    }
}
