
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ListingsService } from '../listings/listings.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class SubscriptionsScheduler {
    private readonly logger = new Logger(SubscriptionsScheduler.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly listingsService: ListingsService,
        private readonly notificationsGateway: NotificationsGateway,
    ) { }

    @Cron(CronExpression.EVERY_HOUR)
    async handleExpirations() {
        const now = new Date();
        this.logger.log(`Running Subscription Expiration Check at ${now.toISOString()}`);

        // 1. Find Expired Subscriptions
        const expiredSubs = await this.prisma.subscription.findMany({
            where: {
                status: 'APPROVED',
                expiresAt: { lte: now }
            },
            include: { user: true }
        });

        for (const sub of expiredSubs) {
            this.logger.log(`Processing expiry for subscription ${sub.id} (User: ${sub.userId})`);

            await this.prisma.$transaction(async (tx) => {
                // A. Mark subscription as EXPIRED
                await tx.subscription.update({
                    where: { id: sub.id },
                    data: { status: 'EXPIRED' as any } // Cast if needed
                });

                // B. Downgrade User to FREE (or check logic if they have other subs?)
                // Assuming single active sub model for now.
                await tx.user.update({
                    where: { id: sub.userId },
                    data: {
                        subscriptionTier: 'FREE',
                        isBusiness: false // Revert generic business flag
                    }
                });
            });

            // C. Enforce Downgrade Limits (Outside transaction to avoid long locks if heavy)
            await this.listingsService.handleDowngrade(sub.userId);

            // D. Send Notification "Your subscription has expired."
            this.notificationsGateway.sendNotification(
                sub.userId,
                'SUBSCRIPTION_EXPIRED',
                {
                    message: 'Your subscription has expired. You have been downgraded to the FREE tier.',
                    tier: 'FREE',
                    expiredAt: sub.expiresAt,
                }
            );
        }
    }

    @Cron(CronExpression.EVERY_HOUR)
    async handleWarnings() {
        // Warning 24h before
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const tomorrowPlus = new Date(tomorrow.getTime() + 60 * 60 * 1000); // 1 hour window

        const expiringSoon = await this.prisma.subscription.findMany({
            where: {
                status: 'APPROVED',
                expiresAt: {
                    gte: tomorrow,
                    lt: tomorrowPlus
                }
            }
        });

        for (const sub of expiringSoon) {
            this.logger.log(`Subscription ${sub.id} expires in 24h. Sending warning.`);
            // Send Notification "Your subscription expires in 24h."
            this.notificationsGateway.sendNotification(
                sub.userId,
                'SUBSCRIPTION_EXPIRING_SOON',
                {
                    message: 'Your subscription expires in 24 hours. Please renew to maintain your benefits.',
                    tier: sub.tier,
                    expiresAt: sub.expiresAt,
                }
            );
        }
    }
}
