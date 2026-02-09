import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { EncryptionService } from '../security/encryption.service';
import { VaultStorageService } from '../security/vault-storage.service';
import { OtpService } from '../auth/otp.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private security: SecurityService,
        private encryption: EncryptionService,
        private vault: VaultStorageService,
        private otpService: OtpService
    ) { }

    // Hardcoded to fetch the 'Demo' user for now
    async findMe() {
        return this.prisma.user.findUnique({
            where: { email: 'demo@meetbarter.com' },
        });
    }

    async findOne(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async getPublicProfile(id: string) {
        // SECURE: Explicitly select only public fields
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                globalTrustScore: true,
                verificationLevel: true,
                createdAt: true,
                listings: {
                    where: { status: 'ACTIVE' },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        images: true,
                        priceVP: true,
                        category: { select: { name: true } }
                    }
                }
            }
        });

        if (!user) return null;

        const { listings, ...profile } = user;
        return { profile, listings };
    }

    async getOtpQueue() {
        const codes = await this.prisma.otpCode.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        const phoneNumbers = codes.map(c => c.phoneNumber);
        const users = await this.prisma.user.findMany({
            where: { phoneNumber: { in: phoneNumbers } },
            select: { id: true, fullName: true, phoneNumber: true, email: true, avatarUrl: true }
        });

        return codes.map(code => {
            const user = users.find(u => u.phoneNumber === code.phoneNumber);
            return {
                ...code,
                user: user || null
            };
        });
    }

    async requestPhoneVerification(userId: string, phoneNumber: string) {
        // Validate phone number format (basic check)
        if (!phoneNumber || phoneNumber.length < 8) {
            throw new BadRequestException('Invalid phone number format');
        }

        // Check if phone is already used by another verified user
        const existing = await this.prisma.user.findFirst({
            where: { phoneNumber, phoneVerified: true, NOT: { id: userId } }
        });

        if (existing) {
            throw new BadRequestException('This phone number is already verified by another account.');
        }

        // 🛡️ Log the request
        await this.security.assessAndLog(userId, {
            action: 'OTP_REQUESTED',
            userId,
            details: { phoneNumber: '***' + phoneNumber.slice(-4) }
        });

        // Generate OTP
        await this.otpService.generateOtp(phoneNumber);

        // Update user's phone number (unverified)
        await this.prisma.user.update({
            where: { id: userId },
            data: { phoneNumber, phoneVerified: false }
        });

        return { success: true, message: 'OTP sent successfully' };
    }

    async confirmPhoneVerification(userId: string, phoneNumber: string, code: string) {
        // Verify OTP
        const isValid = await this.otpService.verifyOtp(phoneNumber, code);

        if (isValid) {
            // Mark user as verified
            await this.prisma.user.update({
                where: { id: userId },
                data: { phoneVerified: true }
            });

            // Log security event
            await this.security.assessAndLog(userId, {
                action: 'PHONE_VERIFIED',
                userId,
                details: { phoneNumber: '***' + phoneNumber.slice(-4) }
            });

            return { success: true, message: 'Phone number verified successfully.' };
        }

        throw new BadRequestException('Verification failed.');
    }

    async requestBusinessVerification(userId: string, businessName: string, evidence: any, referralCode?: string) {
        // 🛡️ Security Hook: Business Verification Request
        await this.security.assessAndLog(userId, {
            action: 'BUSINESS_VERIFY_REQUEST',
            userId,
            details: { businessName, referralCode }
        });

        const encryptedData = this.encryption.encrypt(JSON.stringify({ businessName, referralCode, evidence }));

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                businessName,
                businessVerificationStatus: 'PENDING',
                businessVerificationData: encryptedData,
                referredByUserId: referralCode || undefined
            }
        });
    }

    async submitBusinessLicense(userId: string, data: {
        businessName?: string;
        registrationNumber: string;
        permitType: string;
        issuingAuthority: string;
        evidence: any; // { links: string[], photos: string[] }
        issuedAt: Date;
        expiresAt: Date;
    }) {
        // 🛡️ Security Hook: Institutional Onboarding
        await this.security.assessAndLog(userId, {
            action: 'BUSINESS_LICENSE_SUBMIT',
            userId,
            details: { registrationNumber: data.registrationNumber, permitType: data.permitType }
        });

        if (data.businessName) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { businessName: data.businessName }
            });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { businessName: _, ...licenseData } = data; // Exclude businessName from license data logic below if needed, though spreading is fine if model ignores it

        return this.prisma.businessLicense.upsert({
            where: { userId },
            update: {
                ...licenseData,
                evidence: JSON.stringify(licenseData.evidence),
                status: 'PENDING',
                updatedAt: new Date()
            },
            create: {
                ...licenseData,
                userId,
                evidence: JSON.stringify(licenseData.evidence),
                status: 'PENDING'
            }
        });
    }

    async findPendingLicenses() {
        return this.prisma.businessLicense.findMany({
            where: { status: 'PENDING' },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        businessName: true
                    }
                }
            }
        });
    }

    async verifyBusinessLicense(licenseId: string, adminId: string, status: 'VERIFIED' | 'REJECTED' | 'REVOKED', adminNotes?: string) {
        // 🛡️ Security Hook: Administrative Verification
        await this.security.assessAndLog(adminId, {
            action: 'BUSINESS_LICENSE_VERIFY',
            userId: adminId,
            details: { licenseId, status, adminNotes }
        });

        return this.prisma.$transaction(async (tx) => {
            const license = await tx.businessLicense.update({
                where: { id: licenseId },
                data: {
                    status,
                    adminNotes,
                    lastVerifiedAt: new Date(),
                    updatedAt: new Date()
                }
            });

            if (status === 'VERIFIED') {
                await tx.user.update({
                    where: { id: license.userId },
                    data: {
                        businessVerificationStatus: 'VERIFIED',
                        isBusiness: true,
                        verificationLevel: 3, // Level 3: Institutional
                        subscriptionTier: 'INSTITUTIONAL' // Auto-upgrade to Institutional tier if verified
                    }
                });
            } else if (status === 'REVOKED' || status === 'REJECTED') {
                await tx.user.update({
                    where: { id: license.userId },
                    data: {
                        businessVerificationStatus: status === 'REVOKED' ? 'REVOKED' : 'REJECTED',
                        verificationLevel: status === 'REVOKED' ? 1 : undefined // Downgrade if revoked
                    }
                });
            }

            return license;
        });
    }

    async requestCommunityVerification(userId: string, role: string, evidence: any) {
        const encryptedEvidence = this.encryption.encrypt(JSON.stringify(evidence));

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                communityRole: role,
                communityVerificationStatus: 'PENDING', // Matches "Pending Businesses"
                communityEvidence: encryptedEvidence
            }
        });
    }

    // Phase 2: Multi-Tier Verification logic
    async verifyUserLevel(userId: string, targetLevel: number, complianceNotes: string, adminId: string) {
        // 🛡️ Security Hook: Compliance Action
        await this.security.assessAndLog(adminId, {
            action: 'USER_LEVEL_UPGRADE',
            userId: adminId,
            details: { targetUserId: userId, targetLevel, complianceNotes }
        });

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');

        // Decode existing compliance history
        let complianceHistory: any = { tiers: {} };
        if (user.complianceMetadata) {
            try {
                complianceHistory = JSON.parse(this.encryption.decrypt(user.complianceMetadata));
            } catch {
                // If decryption fails (e.g. key rotation or corruption), start fresh
            }
        }

        complianceHistory.tiers[`L${targetLevel}`] = {
            verifiedAt: new Date(),
            verifiedBy: adminId,
            notes: complianceNotes
        };

        const encryptedMetadata = this.encryption.encrypt(JSON.stringify(complianceHistory));

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                verificationLevel: targetLevel,
                complianceMetadata: encryptedMetadata
            }
        });
    }

    async applyForAmbassador(userId: string) {
        // Eligibility Check: Must have at least X Completed Trades (Dynamic Config)
        const systemConfig = await this.prisma.systemConfig.findUnique({ where: { id: 1 } });
        const threshold = (systemConfig as any)?.ambassadorTradeThreshold || 100;

        const tradeCount = await this.prisma.trade.count({
            where: {
                OR: [{ buyerId: userId }, { sellerId: userId }],
                status: 'COMPLETED'
            }
        });

        if (tradeCount < threshold) {
            throw new Error(`Not eligible yet. You need ${threshold} completed trades. Current: ${tradeCount}`);
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
            where: { communityVerificationStatus: 'PENDING' },
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
