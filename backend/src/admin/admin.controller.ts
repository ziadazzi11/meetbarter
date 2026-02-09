import { Controller, Post, Body, Get, UnauthorizedException, Param, UseGuards, Query, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { TradesService } from '../trades/trades.service';
import { UsersService } from '../users/users.service';
import { ContentModerationService } from '../moderation/content-moderation.service';
import { IntelligenceService } from '../intelligence/intelligence.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../security/security.types';
import { VaultStorageService } from '../security/vault-storage.service';
import { MfaGuard } from '../common/guards/mfa.guard';
import * as path from 'path';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tradesService: TradesService,
        private readonly moderationService: ContentModerationService,
        private readonly usersService: UsersService,
        private readonly securityService: SecurityService, // Added this line
        private readonly vaultStorage: VaultStorageService,
        private readonly intelligence: IntelligenceService
    ) { }

    @Get('intelligence')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.MONITOR_HEARTBEAT) // Using HEARTBEAT as a proxy for strategic monitoring
    async getIntelligence() {
        return this.intelligence.getMarketInsights();
    }

    @Post('intelligence/snapshot')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.MANAGE_KEYS)
    async triggerSnapshot() {
        await this.intelligence.generateMarketSnapshot();
        return { success: true };
    }

    @Get('intelligence/forensic/:userId')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.ACCESS_INTEL)
    async performForensicScan(@Param('userId') userId: string) {
        return this.intelligence.performForensicScan(userId);
    }

    @Get('business-registry')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.APPROVE_BUSINESS)
    async getBusinessRegistry() {
        return this.intelligence.getVerifiedBusinessRegistry();
    }

    @Post('freeze')
    @UseGuards(JwtAuthGuard, PermissionGuard, MfaGuard)
    @Permissions(Permission.SYSTEM_FREEZE)
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
    @UseGuards(JwtAuthGuard, PermissionGuard, MfaGuard)
    @Permissions(Permission.GRANT_VP)
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
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.RESOLVE_DISPUTE_FULL)
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

    @Post('users/:id/verify-level')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.VERIFY_INSTITUTION)
    async verifyUserLevel(
        @Param('id') id: string,
        @Body('level') level: number,
        @Body('reason') reason: string, // Enforce 'reason'
        @Body('code1') code1: string,
        @Body('fingerprintCode') fingerprintCode: string,
    ) {
        if (!reason) throw new Error("Mandatory reason required for level verification.");
        await this.validateAdmin(code1, fingerprintCode);
        return this.usersService.verifyUserLevel(id, level, reason, 'SYSTEM_ADMIN');
    }

    @Get('categories')
    async getCategories() {
        return this.prisma.category.findMany();
    }

    @Post('categories/:id')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.MANAGE_KEYS)
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
                data: { id: 1, isFrozen: false, baseEscrowRate: 15, laborBaseline: 6 }
            });
        }
        // EXCLUDE Heir data from public config fetch for discretion
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { heir1, heir1Key, heir2, heir2Key, heir3, heir3Key, heir4, heir4Key, heir5, heir5Key, ...publicConfig } = config as any;
        return {
            ...publicConfig,
            ambassadorTradeThreshold: (config as any).ambassadorTradeThreshold || 100,
            legalEntityId: (config as any).legalEntityId
        };
    }

    @Post('config/heirs')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.MONITOR_HEARTBEAT)
    async getHeirConfig(@Body('code1') code1: string, @Body('fingerprintCode') fingerprintCode: string) {
        await this.validateAdmin(code1, fingerprintCode);
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
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.MANAGE_KEYS)
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

        @Body('ambassadorTradeThreshold') ambassadorTradeThreshold: number,
        @Body('legalEntityId') legalEntityId: string,
        @Body('code1') code1: string,
        @Body('fingerprintCode') fingerprintCode: string,
    ) {
        await this.validateAdmin(code1, fingerprintCode);

        await this.trackActivity();

        return this.prisma.systemConfig.update({
            where: { id: 1 },
            data: {
                baseEscrowRate: feePercentage, // Map frontend 'feePercentage' to DB 'baseEscrowRate'
                laborBaseline,
                heir1, heir1Key,
                heir2, heir2Key,
                heir3, heir3Key,
                heir4: heir4 as any, heir4Key: heir4Key as any,

                heir5: heir5 as any, heir5Key: heir5Key as any,
                ambassadorTradeThreshold: ambassadorTradeThreshold ? Number(ambassadorTradeThreshold) : undefined,
                legalEntityId: legalEntityId || undefined
            } as any
        });
    }

    @Get('trades')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.RESOLVE_DISPUTE)
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

    @Get('disputes')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.RESOLVE_DISPUTE)
    async getDisputes() {
        return this.prisma.trade.findMany({
            where: { status: 'DISPUTED' },
            include: {
                listing: true,
                buyer: { select: { fullName: true, email: true } },
                seller: { select: { fullName: true, email: true } }
            }
        });
    }

    @Post('trades/:id/resolve-dispute')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.RESOLVE_DISPUTE)
    async resolveDispute(
        @Param('id') id: string,
        @Body('action') action: 'RELEASE' | 'REFUND',
        @Body('reason') reason: string, // Renamed from notes to reflect governance
        @Body('code1') code1: string,
        @Body('fingerprintCode') fingerprintCode: string,
    ) {
        if (!reason) throw new Error("Mandatory reason required for dispute resolution.");
        await this.validateAdmin(code1, fingerprintCode);
        return this.tradesService.resolveDispute(id, action, reason, 'SYSTEM_ADMIN');
    }



    @Get('pending-businesses')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.APPROVE_BUSINESS)
    async getPendingBusinesses() {
        return this.usersService.findPendingBusinesses();
    }



    @Get('pending-licenses')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.APPROVE_BUSINESS)
    async getPendingLicenses() {
        return this.usersService.findPendingLicenses();
    }

    @Post('licenses/:id/verify')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.APPROVE_BUSINESS)
    async verifyLicense(
        @Param('id') id: string,
        @Body('status') status: 'VERIFIED' | 'REJECTED' | 'REVOKED',
        @Body('reason') reason: string,
        @Body('code1') code1: string,
        @Body('fingerprintCode') fingerprintCode: string,
    ) {
        if (!reason) throw new Error("Mandatory reason required for license verification.");
        await this.validateAdmin(code1, fingerprintCode);
        return this.usersService.verifyBusinessLicense(id, 'SYSTEM_ADMIN', status, reason);
    }

    @Get('pending-ambassadors')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.APPROVE_AMBASSADOR)
    async getPendingAmbassadors() {
        return this.usersService.findPendingAmbassadors();
    }

    @Get('moderation/flags')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'MODERATOR')
    async getModerationFlags(@Query('status') status: string) {
        return this.prisma.contentModerationFlag.findMany({
            where: { status: status as any || 'PENDING' },
            include: { reportedBy: { select: { fullName: true, email: true, id: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    @Post('moderation/flags/:id/ban')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async banUserForFlag(@Param('id') id: string, @Req() req) {
        await this.securityService.executeBanForFlag(id, req.user.userId);
        return { status: 'success', message: 'User banned and flag resolved.' };
    }

    @Post('moderation/flags/:id/dismiss')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'MODERATOR')
    async dismissFlag(@Param('id') id: string, @Req() req) {
        await this.prisma.contentModerationFlag.update({
            where: { id },
            data: {
                status: 'REJECTED', // Rejected the FLAG, meaning content is OK (or at least forgiven)
                reviewedBy: req.user.userId,
                reviewedAt: new Date(),
                reviewNotes: 'Flag dismissed by admin.'
            }
        });
        return { status: 'success', message: 'Flag dismissed.' };
    }

    @Post('users/:id/approve-ambassador')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.APPROVE_AMBASSADOR)
    async approveAmbassador(
        @Param('id') id: string,
        @Body('code1') code1: string,
        @Body('fingerprintCode') fingerprintCode: string,
    ) {
        await this.validateAdmin(code1, fingerprintCode);
        return this.usersService.approveAmbassador(id);
    }

    @Get('moderation/flags')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.FLAG_CONTENT)
    async getPendingFlags() {
        return this.moderationService.getPendingFlags();
    }

    @Post('moderation/flags/:id/approve')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.FLAG_CONTENT)
    async approveFlag(
        @Param('id') id: string,
        @Body('code1') code1: string,
        @Body('fingerprintCode') fingerprintCode: string,
        @Body('reason') reason: string, // Enforced
    ) {
        if (!reason) throw new Error("Mandatory reason required for content approval.");
        await this.validateAdmin(code1, fingerprintCode);
        await this.trackActivity();
        return this.moderationService.approveFlag(id, 'SYSTEM_ADMIN', reason);
    }

    @Post('moderation/flags/:id/reject')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.FLAG_CONTENT)
    async rejectFlag(
        @Param('id') id: string,
        @Body('code1') code1: string,
        @Body('fingerprintCode') fingerprintCode: string,
        @Body('reason') reason: string, // Enforced
    ) {
        if (!reason) throw new Error("Mandatory reason required for content removal.");
        await this.validateAdmin(code1, fingerprintCode);
        await this.trackActivity();
        return this.moderationService.rejectFlag(id, 'SYSTEM_ADMIN', reason);
    }

    @Post('vault/export')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.MANAGE_KEYS)
    async exportVault(
        @Body('code1') code1: string,
        @Body('fingerprintCode') fingerprintCode: string,
    ) {
        await this.validateAdmin(code1, fingerprintCode);
        await this.trackActivity();

        const files = await this.vaultStorage.listAllDocuments();
        const exportData = [];

        for (const file of files) {
            const buffer = await this.vaultStorage.getDocument(file);
            exportData.push({
                name: path.basename(file),
                content: buffer.toString('base64')
            });
        }

        return {
            timestamp: new Date().toISOString(),
            files: exportData
        };
    }

    @Post('config/rotate-codes')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.MANAGE_KEYS)
    async rotateCodes(
        @Body('code1') code1: string,
        @Body('fingerprintCode') fingerprintCode: string,
        @Body('newAlpha') newAlpha: string,
        @Body('newBeta') newBeta: string,
        @Body('newFingerprint') newFingerprint: string,
    ) {
        await this.validateAdmin(code1, fingerprintCode);
        await this.trackActivity();

        await this.prisma.systemConfig.update({
            where: { id: 1 },
            data: {
                alphaCode: newAlpha,
                betaCode: newBeta,
                fingerprintCode: newFingerprint,
            }
        });

        // Log the rotation (but NOT the new codes)
        await this.prisma.auditLog.create({
            data: {
                action: 'ROTATE_ADMIN_CODES',
                details: JSON.stringify({ timestamp: new Date().toISOString() }),
                adminId: 'SYSTEM_ADMIN'
            }
        });

        return { success: true, message: 'Master Codes Rotated Successfully' };
    }

    @Post('config/crisis-override')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.MONITOR_HEARTBEAT)
    async overrideCrisis(
        @Body('city') city: string,
        @Body('country') country: string,
        @Body('active') active: boolean,
        @Body('reason') reason: string, // Enforced
        @Body('code1') code1: string,
        @Body('fingerprintCode') fingerprintCode: string,
    ) {
        if (!reason) throw new Error("Mandatory reason required for crisis override.");
        await this.validateAdmin(code1, fingerprintCode);
        await this.trackActivity();

        // Manual Override: Force Crisis State
        await this.prisma.cityPulseCache.upsert({
            where: { city_country: { city, country } },
            update: { isCrisisActive: active, sentimentScore: active ? 0 : 50 },
            create: {
                city,
                country,
                isCrisisActive: active,
                sentimentScore: active ? 0 : 50,
                activeTraders: 0,
                newListingsToday: 0,
                lastUpdated: new Date(),
                topCategories: '[]'
            }
        });

        // Audit Log
        await this.prisma.auditLog.create({
            data: {
                action: 'CRISIS_OVERRIDE',
                details: JSON.stringify({ city, country, active, reason }),
                adminId: 'SYSTEM_ADMIN'
            }
        });

        return { success: true, message: `Crisis Mode ${active ? 'ACTIVATED' : 'DEACTIVATED'} for ${city}` };
    }

    @Post('emergency-unlock')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.EMERGENCY_UNLOCK)
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

        // Condition 1: Six-Year Inactivity
        const sixYearsAgo = new Date();
        sixYearsAgo.setFullYear(sixYearsAgo.getFullYear() - 6);

        if (configAny.lastAdminActivity > sixYearsAgo) {
            throw new UnauthorizedException('Access Denied. Owner was active within the last 6 years (2190 days). Survival Protocol Suspended.');
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

    @Get('otp-queue')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.VIEW_AUDITS)
    getOtpQueue() {
        return this.usersService.getOtpQueue();
    }

    @Get('audit-logs')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.VIEW_AUDITS)

    async getAuditLogs() {
        const logs = await this.prisma.auditLog.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
        });
        const count = await this.prisma.auditLog.count();
        return { logs, count };
    }
}
