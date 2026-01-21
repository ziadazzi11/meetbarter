import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Activity Service - Tracks user activity metrics for trust signals
 * - Last seen tracking
 * - Average reply time calculation (metadata only, no content analysis)
 */
@Injectable()
export class ActivityService {
    constructor(private prisma: PrismaService) { }

    /**
     * Update user's last seen timestamp
     */
    async updateLastSeen(userId: string) {
        await this.prisma.userActivityMetric.upsert({
            where: { userId },
            update: { lastSeenAt: new Date() },
            create: { userId, lastSeenAt: new Date() }
        });
    }

    /**
     * Get activity metrics for a user
     */
    async getUserActivity(userId: string) {
        const metric = await this.prisma.userActivityMetric.findUnique({
            where: { userId }
        });

        if (!metric) return null;

        return {
            lastSeenAt: metric.lastSeenAt,
            averageReplyHours: metric.averageReplyHours,
            lastSeenDisplay: this.formatLastSeen(metric.lastSeenAt)
        };
    }

    /**
     * Calculate average reply time for a user based on last 20 message interactions
     */
    async calculateAverageReplyTime(userId: string): Promise<number | null> {
        // Get last 20 messages sent by this user
        const messages = await this.prisma.message.findMany({
            where: { senderId: userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                id: true,
                createdAt: true,
                listingId: true,
                receiverId: true
            }
        });

        if (messages.length < 2) return null;

        // Calculate time between consecutive messages to same conversation
        const replyTimes: number[] = [];
        for (let i = 0; i < messages.length - 1; i++) {
            const current = messages[i];
            const next = messages[i + 1];

            // If same listing (conversation context)
            if (current.listingId === next.listingId) {
                const timeDiff = current.createdAt.getTime() - next.createdAt.getTime();
                const hours = timeDiff / (1000 * 60 * 60);
                if (hours > 0 && hours < 168) { // Less than 1 week
                    replyTimes.push(hours);
                }
            }
        }

        if (replyTimes.length === 0) return null;

        // Calculate average
        const average = replyTimes.reduce((a, b) => a + b, 0) / replyTimes.length;
        return Math.round(average * 10) / 10; // Round to 1 decimal
    }

    /**
     * Cron job to update activity metrics every 30 minutes
     */
    @Cron(CronExpression.EVERY_30_MINUTES)
    async updateActivityMetrics() {
        console.log('[ActivityCron] Starting activity metrics update...');

        // Get all users who have sent messages (active users)
        const activeUsers = await this.prisma.message.findMany({
            select: { senderId: true },
            distinct: ['senderId']
        });

        for (const { senderId } of activeUsers) {
            const avgReplyHours = await this.calculateAverageReplyTime(senderId);

            await this.prisma.userActivityMetric.upsert({
                where: { userId: senderId },
                update: {
                    averageReplyHours: avgReplyHours,
                    calculatedAt: new Date()
                },
                create: {
                    userId: senderId,
                    averageReplyHours: avgReplyHours,
                    calculatedAt: new Date()
                }
            });
        }

        console.log(`[ActivityCron] Updated metrics for ${activeUsers.length} users`);
    }

    /**
     * Format last seen into human-readable text
     */
    private formatLastSeen(lastSeenAt: Date): string {
        const now = new Date();
        const diff = now.getTime() - lastSeenAt.getTime();
        const hours = diff / (1000 * 60 * 60);

        if (hours < 1) return 'Active now';
        if (hours < 24) return 'Today';
        if (hours < 48) return 'Yesterday';

        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;

        return 'Over a month ago';
    }
}
