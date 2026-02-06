import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
    constructor(private readonly prisma: PrismaService) { }

    private readonly PLANS = [
        {
            tier: 'FREE',
            name: 'Standard',
            price: 0,
            currency: 'USD',
            listingLimit: 5,
            features: [
                '5 Active Listings',
                'Basic Search',
                'Community Access'
            ]
        },
        {
            tier: 'BUSINESS',
            name: 'Business',
            price: 10, // Monthly base
            currency: 'USD',
            listingLimit: 20,
            features: [
                '20 Active Listings',
                'Verified Business Badge',
                'Priority Support',
                'Advanced Analytics'
            ],
            pricing: {
                monthly: 10,
                yearly: 80
            }
        },
        {
            tier: 'PREMIUM',
            name: 'Institutional',
            price: 25, // Monthly base
            currency: 'USD',
            listingLimit: 9999,
            features: [
                'Unlimited Listings',
                'API Access',
                'Dedicated Account Manager',
                'Bulk Upload Tools'
            ],
            pricing: {
                monthly: 25,
                yearly: 150
            }
        }
    ];

    async requestSubscription(userId: string, tier: string, amount: number, currency: string, duration: 'MONTHLY' | 'YEARLY' = 'MONTHLY') {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // Calculate Expiry
        const days = duration === 'YEARLY' ? 365 : 30;
        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        // Create a subscription record with PENDING status
        return this.prisma.subscription.create({
            data: {
                userId,
                tier,
                amount,
                currency,
                status: 'PENDING',
                expiresAt,
            },
        });
    }

    async verifySubscription(subId: string, adminId: string, transactionId?: string) {
        const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || admin.role !== 'ADMIN') {
            throw new BadRequestException('Only admins can verify subscriptions');
        }

        const sub = await this.prisma.subscription.findUnique({ where: { id: subId } });
        if (!sub) throw new NotFoundException('Subscription not found');

        return this.prisma.$transaction(async (tx) => {
            // 1. Mark subscription as APPROVED
            const updatedSub = await tx.subscription.update({
                where: { id: subId },
                data: {
                    status: 'APPROVED',
                    transactionId: transactionId,
                },
            });

            // 2. Update user tier and business status
            await tx.user.update({
                where: { id: sub.userId },
                data: {
                    subscriptionTier: sub.tier,
                    isBusiness: sub.tier === 'BUSINESS' || sub.tier === 'PREMIUM',
                },
            });

            return updatedSub;
        });
    }

    async getPending() {
        return this.prisma.subscription.findMany({
            where: { status: 'PENDING' },
            include: { user: { select: { fullName: true, email: true } } },
        });
    }

    async getUserSubscriptions(userId: string) {
        return this.prisma.subscription.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    getPlans() {
        return this.PLANS;
    }
}
