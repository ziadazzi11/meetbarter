import { Controller, Post, Body, Get, UnauthorizedException, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TradesService } from '../trades/trades.service';

import { ContentModerationService } from '../moderation/content-moderation.service';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tradesService: TradesService,
        private readonly moderationService: ContentModerationService
    ) { }

    @Post('freeze')
    async setFreeze(
        @Body('frozen') frozen: boolean,
        @Body('code1') code1: string,
        @Body('code2') code2: string,
        @Body('fingerprintCode') fingerprintCode: string,
    ) {
        await this.validateAdmin(code1, fingerprintCode, code2);
        await this.trackActivity();

        const freezeConfig = await this.prisma.systemConfig.upsert({
            where: { id: 1 },
            update: { isFrozen: frozen },
            create: { id: 1, isFrozen: frozen },
        });

        // AUDIT LOG
        await this.prisma.auditLog.create({
            data: {
                action: 'FREEZE_SYSTEM',
                details: JSON.stringify({ frozen }),
                adminId: 'SYSTEM_ADMIN'
            }
        });

        return freezeConfig;
    }

    @Get('status')
    async getStatus() {
        const config = await this.prisma.systemConfig.findFirst();
        return { isFrozen: config?.isFrozen || false };
    }

    @Post('grant')
    async grantVP(
        @Body('email') email: string,
        @Body('amount') amount: number,
        @Body('reason') reason: string,
        @Body('code1') code1: string,
        @Body('fingerprintCode') fingerprintCode: string,
    ) {
        await this.validateAdmin(code1, fingerprintCode);

        await this.trackActivity();

        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('User not found');

        // Transactional Grant
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: user.id },
                data: { walletBalance: { increment: amount } }
            }),
            this.prisma.communityGrant.create({
                data: {
                    recipientId: user.id,
                    amountVP: amount,
                    reason,
                    adminId: 'SYSTEM_ADMIN'
                }
            }),
            this.prisma.auditLog.create({
                data: {
                    action: 'GRANT_VP',
                    details: JSON.stringify({ recipient: email, amount, reason }),
                    adminId: 'SYSTEM_ADMIN'
                }
            })
        ]);

        return { success: true };
    }

    @Post('trades/:id/verify')
    async verifyTrade(
        @Param('id') id: string,
        @Body('bucketAllocations') bucketAllocations: { bucket: string, amountVP: number, justification: string }[],
        @Body('code1') code1: string,
        @Body('fingerprintCode') fingerprintCode: string,
    ) {
        await this.validateAdmin(code1, fingerprintCode);

        await this.trackActivity();

        const result = await this.tradesService.verifyTrade(id, bucketAllocations, 'SYSTEM_ADMIN');

        // AUDIT LOG
        await this.prisma.auditLog.create({
            data: {
                action: 'VERIFY_TRADE',
                details: JSON.stringify({ id, bucketAllocations }),
                adminId: 'SYSTEM_ADMIN'
            }
        });

        return result;
    }

    @Get('categories')
    async getCategories() {
        return this.prisma.category.findMany();
    }

    @Post('categories/:id')
    async updateCategoryConfig(
        @Param('id') id: string,
        @Body('escrowPercentage') escrowPercentage: number,
        @Body('maxModerationVP') maxModerationVP: number,
        @Body('maxVerificationVP') maxVerificationVP: number,
        @Body('maxDisputeVP') maxDisputeVP: number,
        @Body('maxLogisticsVP') maxLogisticsVP: number,
        @Body('maxFraudVP') maxFraudVP: number,
        @Body('code1') code1: string,
        @Body('fingerprintCode') fingerprintCode: string,
    ) {
        await this.validateAdmin(code1, fingerprintCode);

        await this.trackActivity();

        return this.prisma.category.update({
            where: { id },
            data: {
                escrowPercentage,
                maxModerationVP,
                maxVerificationVP,
                maxDisputeVP,
                maxLogisticsVP,
                maxFraudVP
            }
        });
    }

    @Get('config')
    async getConfig() {
        let config = await this.prisma.systemConfig.findUnique({ where: { id: 1 } });
        if (!config) {
            config = await this.prisma.systemConfig.create({
                data: { id: 1, isFrozen: false, feePercentage: 15, laborBaseline: 6 }
            });
        }
        // EXCLUDE Heir data from public config fetch for discretion
        const { heir1, heir1Key, heir2, heir2Key, heir3, heir3Key, heir4, heir4Key, heir5, heir5Key, ...publicConfig } = config as any;
        return publicConfig;
    }

    @Post('config/heirs')
    async getHeirConfig(@Body('code1') code1: string, @Body('fingerprintCode') fingerprintCode: string) {
        const config = await this.prisma.systemConfig.findUnique({ where: { id: 1 } });
        const c: any = config || {};
        if (!config) return {};
        return {
            heir1: c.heir1,
            heir1Key: c.heir1Key,
            heir2: c.heir2,
            heir2Key: c.heir2Key,
            heir3: c.heir3,
            heir3Key: c.heir3Key,
            heir4: c.heir4,
            heir4Key: c.heir4Key,
            heir5: c.heir5,
            heir5Key: c.heir5Key,
        };
    }

    @Post('config')
    async updateConfig(
        @Body('feePercentage') feePercentage: number,
        @Body('laborBaseline') laborBaseline: number,
        @Body('heir1') heir1: string,
        @Body('heir1Key') heir1Key: string,
        @Body('heir2') heir2: string,
        @Body('heir2Key') heir2Key: string,
        @Body('heir3') heir3: string,
        @Body('heir3Key') heir3Key: string,
        @Body('heir4') heir4: string,
        @Body('heir4Key') heir4Key: string,
        @Body('heir5') heir5: string,
        @Body('heir5Key') heir5Key: string,
        @Body('code1') code1: string,
        @Body('fingerprintCode') fingerprintCode: string,
    ) {
        await this.validateAdmin(code1, fingerprintCode);

        await this.trackActivity();

        return this.prisma.systemConfig.update({
            where: { id: 1 },
            data: {
                feePercentage,
                laborBaseline,
                heir1, heir1Key,
                heir2, heir2Key,
                heir3, heir3Key,
                heir4: heir4 as any, heir4Key: heir4Key as any,
                heir5: heir5 as any, heir5Key: heir5Key as any
            } as any
        });
    }

    @Get('trades')
    async getTrades() {
        return this.prisma.trade.findMany({
            where: {
                status: 'LOCKED',
                isVerified: false
            },
            include: {
                listing: true,
                buyer: { select: { fullName: true, email: true } },
                seller: { select: { fullName: true, email: true } }
            }
        });
    }

    @Get('audit-logs')
    async getAuditLogs() {
        return this.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }

    @Get('pending-businesses')
    async getPendingBusinesses() {
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

    @Get('moderation/flags')
    async getPendingFlags() {
        return this.moderationService.getPendingFlags();
    }

    @Post('moderation/flags/:id/approve')
    async approveFlag(
        @Param('id') id: string,
        @Body('code1') code1: string,
        @Body('fingerprintCode') fingerprintCode: string,
        @Body('notes') notes?: string,
    ) {
        await this.validateAdmin(code1, fingerprintCode);
        await this.trackActivity();
        return this.moderationService.approveFlag(id, 'SYSTEM_ADMIN', notes);
    }

    @Post('moderation/flags/:id/reject')
    async rejectFlag(
        @Param('id') id: string,
        @Body('code1') code1: string,
        @Body('fingerprintCode') fingerprintCode: string,
        @Body('notes') notes?: string,
    ) {
        await this.validateAdmin(code1, fingerprintCode);
        await this.trackActivity();
        return this.moderationService.rejectFlag(id, 'SYSTEM_ADMIN', notes);
    }

    @Post('emergency-unlock')
    async emergencyUnlock(
        @Body('key1') key1: string,
        @Body('key2') key2: string,
        @Body('key3') key3: string,
        @Body('key4') key4: string,
        @Body('key5') key5: string,
        @Body('deathDate') deathDate: string,
        @Body('deathPlace') deathPlace: string,
        @Body('mokhtarName') mokhtarName: string,
        @Body('mokhtarLicense') mokhtarLicense: string,
    ) {
        const config = await this.prisma.systemConfig.findUnique({ where: { id: 1 } });
        if (!config) throw new UnauthorizedException('System Configuration Missing');

        const configAny: any = config;

        // Condition 1: One Year Inactivity
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        if (configAny.lastAdminActivity > oneYearAgo) {
            throw new UnauthorizedException('Access Denied. Owner was active within the last year. Survival Protocol Suspended.');
        }

        // Condition 2: Certificate Metadata Presence
        if (!deathDate || !deathPlace || !mokhtarName || !mokhtarLicense) {
            throw new UnauthorizedException('Incomplete Death Registration. Mokhtar verified certificate required.');
        }

        // High-Security: Requires five distinct keys from named heirs stored in DB
        if (
            key1 !== configAny.heir1Key ||
            key2 !== configAny.heir2Key ||
            key3 !== configAny.heir3Key ||
            key4 !== configAny.heir4Key ||
            key5 !== configAny.heir5Key
        ) {
            throw new UnauthorizedException('Multi-Heir Overrule Denied. Invalid Succession Keys.');
        }

        // Permanently flag system as deceased-controlled and record proof
        await this.prisma.systemConfig.update({
            where: { id: 1 },
            data: {
                deathCertificateVerified: true,
                deathDate,
                deathPlace,
                mokhtarName,
                mokhtarLicense
            } as any
        });

        // Return the current system codes so the heirs can regain control
        return {
            message: 'Heir Protocol Authenticated. Access Restored.',
            alpha: configAny.alphaCode,
            beta: configAny.betaCode,
            fingerprint: configAny.fingerprintCode
        };
    }

    private async validateAdmin(code1: string, fingerprintCode: string, code2?: string) {
        const config = await this.prisma.systemConfig.findUnique({ where: { id: 1 } });
        const c: any = config || {};
        if (code1 !== c.alphaCode || fingerprintCode !== c.fingerprintCode) {
            throw new UnauthorizedException('Invalid Admin Codes');
        }
        if (code2 && code2 !== c.betaCode) {
            throw new UnauthorizedException('Invalid Triple-Lock Verification Codes');
        }
    }

    private async trackActivity() {
        await this.prisma.systemConfig.update({
            where: { id: 1 },
            data: { lastAdminActivity: new Date() } as any
        });
    }
}
