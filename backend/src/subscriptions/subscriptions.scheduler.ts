
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ListingsService } from '../listings/listings.service';

@Injectable()
export class SubscriptionsScheduler {
    private readonly logger = new Logger(SubscriptionsScheduler.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly listingsService: ListingsService
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

            // D. TODO: Send Notification "Your subscription has expired."
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
            // TODO: Send Notification "Your subscription expires in 24h."
        }
    }
}
