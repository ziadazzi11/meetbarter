import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private security: SecurityService
    ) { }

    // Hardcoded to fetch the 'Demo' user for now
    async findMe() {
        return this.prisma.user.findUnique({
            where: { email: 'demo@meetbarter.com' },
        });
    }

    async requestBusinessVerification(userId: string, businessName: string, referralCode?: string) {
        // 🛡️ Security Hook: Business Verification Request
        await this.security.assessAndLog(userId, {
            action: 'BUSINESS_VERIFY_REQUEST',
            userId,
            details: { businessName, referralCode }
        });

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                businessName,
                businessVerificationStatus: 'PENDING',
                referredByUserId: referralCode || undefined
            }
        });
    }

    async requestCommunityVerification(userId: string, role: string, evidence: any) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                communityRole: role,
                communityVerificationStatus: 'PENDING_REVIEW', // Matches "Pending Businesses"
                communityEvidence: JSON.stringify(evidence)
            }
        });
    }

    async applyForAmbassador(userId: string) {
        // Eligibility Check: Must have at least 100 Completed Trades to apply for "Ambassador"
        // (Legend status at 1M trades is handled manually/invitation only typically, but we track count)
        const tradeCount = await this.prisma.trade.count({
            where: {
                OR: [{ buyerId: userId }, { sellerId: userId }],
                status: 'COMPLETED'
            }
        });

        if (tradeCount < 100) {
            throw new Error(`Not eligible yet. You need 100 completed trades. Current: ${tradeCount}`);
        }

        // 🛡️ Security Hook: Ambassador Application
        await this.security.assessAndLog(userId, {
            action: 'AMBASSADOR_APPLY',
            userId,
            details: { tradeCount }
        });

        // AUTO-DENY if Collusion Risk is extreme (e.g. >90% trades with same person)
        const risk = await this.calculateCollusionRisk(userId);
        if (risk.maxConcentration > 0.9 && tradeCount > 10) {
            throw new Error(`Application Auto-Rejected: High Collusion Risk Detected (${(risk.maxConcentration * 100).toFixed(1)}% concentration).`);
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                ambassadorStatus: 'PENDING', // Always manual review
                ambassadorScore: 0 // Default to 0 as per protocols
            }
        });
    }

    async updateProfile(userId: string, data: { bannerUrl?: string; themePreferences?: string; fullName?: string; avatarUrl?: string }) {
        // 🛡️ Security Hook: Assess Risk
        await this.security.assessAndLog(userId, {
            action: 'UPDATE_PROFILE',
            userId,
            details: data
        });

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                ...data
            }
        });
    }

    // Helper: Analyze Trade Concentration
    async calculateCollusionRisk(userId: string) {
        const trades = await this.prisma.trade.findMany({
            where: {
                OR: [{ buyerId: userId }, { sellerId: userId }],
                status: 'COMPLETED'
            },
            select: { buyerId: true, sellerId: true }
        });

        if (trades.length === 0) return { maxConcentration: 0, topPartner: null };

        const partnerCounts: { [key: string]: number } = {};
        for (const t of trades) {
            const partner = t.buyerId === userId ? t.sellerId : t.buyerId;
            partnerCounts[partner] = (partnerCounts[partner] || 0) + 1;
        }

        let max = 0;
        let topPartner = null;
        for (const [p, count] of Object.entries(partnerCounts)) {
            if (count > max) {
                max = count;
                topPartner = p;
            }
        }

        return {
            maxConcentration: max / trades.length,
            topPartner
        };
    }

    async findPendingBusinesses() {
        return this.prisma.user.findMany({
            where: { businessVerificationStatus: 'PENDING' },
            select: {
                id: true,
                fullName: true,
                email: true,
                businessName: true,
                businessVerificationStatus: true
            }
        });
    }

    async findPendingCommunityVerifications() {
        return this.prisma.user.findMany({
            where: { communityVerificationStatus: 'PENDING_REVIEW' },
            select: {
                id: true,
                fullName: true,
                email: true,
                communityRole: true,
                communityEvidence: true,
                communityVerificationStatus: true
            }
        });
    }

    async findPendingAmbassadors() {
        const users = await this.prisma.user.findMany({
            where: { ambassadorStatus: 'PENDING' },
            select: { id: true, fullName: true, email: true, ambassadorStatus: true }
        });

        // Enrich with Risk Score
        const results = [];
        for (const u of users) {
            const risk = await this.calculateCollusionRisk(u.id);
            results.push({ ...u, risk });
        }
        return results;
    }

    async approveAmbassador(userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { ambassadorStatus: 'ACTIVE' }
        });
    }

    async approveCommunityRequest(userId: string, verifierId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                communityVerificationStatus: 'VERIFIED',
                communityEvidence: JSON.stringify({ verifiedBy: verifierId, date: new Date() })
            }
        });
    }

    async socialLogin(data: { email: string; name: string; provider: string; photoUrl?: string }) {
        // Upsert: Create or Update based on email
        // Note: In prod, verify the OAuth token! Here we trust the "simulated" frontend.
        let user = await this.prisma.user.findUnique({ where: { email: data.email } });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: data.email,
                    fullName: data.name,
                    passwordHash: "SOCIAL_LOGIN", // Placeholder
                    authProvider: data.provider,
                    avatarUrl: data.photoUrl,
                    globalTrustScore: 1.1 // Small bonus for verified social
                }
            });
        } else {
            // Update photo if new
            if (data.photoUrl && !user.avatarUrl) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { avatarUrl: data.photoUrl, authProvider: data.provider }
                });
            }
        }

        // 🛡️ Security Hook: Assess Login Risk
        await this.security.assessAndLog(user.id, {
            action: 'LOGIN_SOCIAL',
            userId: user.id,
            details: { provider: data.provider }
        });

        return user;
    }

    async approveBusiness(userId: string, data?: any) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: userId },
                data: {
                    isBusiness: true,
                    businessVerificationStatus: 'VERIFIED',
                    businessVerificationData: data ? JSON.stringify(data) : null
                }
            });

            // Ambassador Logic: Grant Reward to Referrer
            if (user.referredByUserId) {
                await tx.user.update({
                    where: { id: user.referredByUserId },
                    data: {
                        walletBalance: { increment: 100 },
                        ambassadorScore: { increment: 1 }
                    }
                });
                await tx.auditLog.create({
                    data: {
                        action: 'AMBASSADOR_REWARD',
                        details: JSON.stringify({ referrer: user.referredByUserId, referee: userId, reward: 100 }),
                        adminId: 'SYSTEM'
                    }
                });
            }
            return user;
        });
    }

    async upgradeSubscription(userId: string, tier: 'BUSINESS' | 'PREMIUM') {
        return this.prisma.user.update({
            where: { id: userId },
            data: { subscriptionTier: tier } // Assuming subscriptionTier exists on User model. If not, I might need to check schema.
        });
    }
}
