import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import {
    PROHIBITED_CATEGORIES,
    REGION_PROHIBITED_ITEMS,
    GLOBAL_PROHIBITED_KEYWORDS,
    DEFAULT_PROHIBITED_ITEMS,
    MODERATION_SEVERITY,
    CATEGORY_SEVERITY_MAP,
    VIOLATION_THRESHOLDS,
} from '../config/prohibited-items.config';

interface ModerationResult {
    isAllowed: boolean;
    severity?: string;
    category?: string;
    matchedKeywords?: string[];
    reason?: string;
}

@Injectable()
export class ContentModerationService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
    ) { }

    /**
     * Scan listing content for prohibited items
     */
    async scanListing(
        title: string,
        description: string,
        country: string,
    ): Promise<ModerationResult> {
        const content = `${title} ${description}`.toLowerCase();

        // Get region-specific prohibited items
        const regionProhibited = REGION_PROHIBITED_ITEMS[country] || DEFAULT_PROHIBITED_ITEMS;

        // Check region-specific prohibitions first
        for (const [category, keywords] of Object.entries(regionProhibited)) {
            const matched = this.findMatchedKeywords(content, keywords as string[]);
            if (matched.length > 0) {
                return {
                    isAllowed: false,
                    severity: CATEGORY_SEVERITY_MAP[category] || MODERATION_SEVERITY.MEDIUM_RISK,
                    category,
                    matchedKeywords: matched,
                    reason: `Prohibited in ${country}: ${category}`,
                };
            }
        }

        // Check global prohibitions
        for (const [category, keywords] of Object.entries(GLOBAL_PROHIBITED_KEYWORDS)) {
            const matched = this.findMatchedKeywords(content, keywords as string[]);
            if (matched.length > 0) {
                return {
                    isAllowed: false,
                    severity: CATEGORY_SEVERITY_MAP[category] || MODERATION_SEVERITY.HIGH_RISK,
                    category,
                    matchedKeywords: matched,
                    reason: `Globally prohibited: ${category}`,
                };
            }
        }

        return { isAllowed: true };
    }

    /**
     * Find matched keywords in content
     */
    private findMatchedKeywords(content: string, keywords: string[]): string[] {
        return keywords.filter((keyword) =>
            content.includes(keyword.toLowerCase()),
        );
    }

    /**
     * Create a moderation flag
     */
    async createFlag(data: {
        listingId: string;
        reason: string;
        category: string;
        severity: string;
        reportedByUserId: string;
        matchedKeywords?: string[];
    }) {
        return this.prisma.contentModerationFlag.create({
            data: {
                listingId: data.listingId,
                reason: data.reason,
                category: data.category,
                severity: data.severity,
                reportedByUserId: data.reportedByUserId,
                matchedKeywords: data.matchedKeywords ? JSON.stringify(data.matchedKeywords) : null,
                status: 'PENDING',
            },
        });
    }

    /**
     * Handle auto-rejection (for AUTO_REJECT severity)
     */
    async autoRejectListing(listingId: string, reason: string) {
        await this.prisma.listing.update({
            where: { id: listingId },
            data: {
                isActive: false,
                moderationStatus: 'REJECTED',
            },
        });
    }

    /**
     * Set listing to pending review
     */
    async setPendingReview(listingId: string) {
        await this.prisma.listing.update({
            where: { id: listingId },
            data: {
                isActive: false,
                moderationStatus: 'PENDING',
            },
        });
    }

    /**
     * Increment user report count and check for ban
     */
    async handleUserViolation(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { reportCount: true },
        });

        const newReportCount = (user?.reportCount || 0) + 1;

        if (newReportCount >= VIOLATION_THRESHOLDS.PERMANENT_BAN) {
            // Permanent ban
            await this.banUser(userId, 'Repeated violations (3+ confirmed)');
        } else if (newReportCount === VIOLATION_THRESHOLDS.TEMPORARY_BAN) {
            // TODO: Implement 7-day temporary ban
            await this.prisma.user.update({
                where: { id: userId },
                data: { reportCount: newReportCount },
            });
        } else {
            // Warning
            await this.prisma.user.update({
                where: { id: userId },
                data: { reportCount: newReportCount },
            });
        }

        return newReportCount;
    }

    /**
     * Ban user and deactivate all their listings
     */
    async banUser(userId: string, reason: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isBanned: true,
                banReason: reason,
                bannedAt: new Date(),
            },
        });

        // Deactivate all listings
        await this.prisma.listing.updateMany({
            where: { sellerId: userId },
            data: { isActive: false },
        });
    }

    /**
     * Get all pending moderation flags (for admin review)
     */
    async getPendingFlags() {
        return this.prisma.contentModerationFlag.findMany({
            where: { status: 'PENDING' },
            include: {
                listing: {
                    include: {
                        seller: {
                            select: {
                                id: true,
                                email: true,
                                fullName: true,
                                reportCount: true,
                                isBanned: true,
                            },
                        },
                    },
                },
                reportedBy: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Approve a flagged listing
     */
    async approveFlag(flagId: string, adminId: string, notes?: string) {
        await this.prisma.contentModerationFlag.update({
            where: { id: flagId },
            data: {
                status: 'APPROVED',
                reviewedBy: adminId,
                reviewNotes: notes,
                reviewedAt: new Date(),
            },
        });

        // Reactivate listing
        const flag = await this.prisma.contentModerationFlag.findUnique({
            where: { id: flagId },
            select: { listingId: true },
        });

        if (flag) {
            await this.prisma.listing.update({
                where: { id: flag.listingId },
                data: {
                    isActive: true,
                    moderationStatus: 'APPROVED',
                },
            });
        }
    }

    /**
     * Reject a flagged listing and increment user violations
     */
    async rejectFlag(flagId: string, adminId: string, notes?: string) {
        const flag = await this.prisma.contentModerationFlag.findUnique({
            where: { id: flagId },
            include: {
                listing: {
                    select: { sellerId: true },
                },
            },
        });

        if (!flag) return;

        await this.prisma.contentModerationFlag.update({
            where: { id: flagId },
            data: {
                status: 'REJECTED',
                reviewedBy: adminId,
                reviewNotes: notes,
                reviewedAt: new Date(),
            },
        });

        // Keep listing deactivated
        await this.prisma.listing.update({
            where: { id: flag.listingId },
            data: {
                isActive: false,
                moderationStatus: 'REJECTED',
            },
        });

        // Increment user violations
        await this.handleUserViolation(flag.listing.sellerId);
    }
}
