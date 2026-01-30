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

    /**
     * Detects "Ring Fraud" (Circular Trading) using recursive graph analysis.
     * Checks for A -> B -> C -> A patterns up to depth 3.
     */
    async detectRingFraud(userId: string, depth: number = 3): Promise<boolean> {
        return this.checkCycle(userId, userId, depth, new Set());
    }

    private async checkCycle(startNode: string, currentNode: string, depth: number, visited: Set<string>): Promise<boolean> {
        if (depth === 0) return false;

        visited.add(currentNode);

        // Find who 'currentNode' has bought from (flow of money/VP)
        // If A buys from B, money goes A->B. A ring is A->B->C->A.
        // So we look for trades where buyer=currentNode.
        const recentTrades = await this.prisma.trade.findMany({
            where: { buyerId: currentNode, status: 'COMPLETED' },
            select: { sellerId: true },
            distinct: ['sellerId'],
            take: 5 // Optimization: Check only top 5 recent interactions
        });

        for (const trade of recentTrades) {
            if (trade.sellerId === startNode) return true; // Cycle found!
            if (!visited.has(trade.sellerId)) {
                if (await this.checkCycle(startNode, trade.sellerId, depth - 1, new Set(visited))) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Detects "Low-and-Slow" brute force attacks.
     * Looks for consistent failure patterns spread over long durations (e.g., 1 fail/hour).
     */
    async detectLowAndSlowAttack(userId: string): Promise<boolean> {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Count failed login attempts in the last 24 hours
        // Note: This relies on an 'AuditLog' or 'LoginAttempt' table. 
        // Adapting to use AuditLog since we saw it exists in SecurityService.
        const failedAttempts = await this.prisma.auditLog.count({
            where: {
                userId: userId,
                action: 'LOGIN_FAILURE',
                createdAt: { gte: twentyFourHoursAgo }
            }
        });

        // Threshold: > 10 failures in 24 hours (approx 1 every 2 hours) is suspicious for a targeted account
        // standard rate limiters might miss this if they reset every hour.
        return failedAttempts > 10;
    }
}
