import { Injectable, Logger } from '@nestjs/common';
import { AuditLogger } from './audit.logger';
import { RiskEngine } from './risk.engine';
import { FraudDetector } from './fraud.detector';
import { RiskLevel, SecurityEvent } from './security.types';
import { BehaviorAnalyzer } from './behavior.analyzer';
import { IpIntel } from './ip.intel';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SecurityService {
    private readonly logger = new Logger(SecurityService.name);

    constructor(
        private auditLogger: AuditLogger,
        private riskEngine: RiskEngine,
        private fraudDetector: FraudDetector,
        private behaviorAnalyzer: BehaviorAnalyzer,
        private ipIntel: IpIntel,
        private prisma: PrismaService
    ) { }

    /**
     * The Main Entry Point for "Phase II" Security Checks.
     * Evaluates Risk -> Logs Event -> Enforces Policy.
     */
    async assessAndLog(userId: string, event: SecurityEvent): Promise<boolean> {
        // 0. Pre-Computation Checks (New Modules)
        const behavior = await this.behaviorAnalyzer.analyze(userId, event.details || {});
        const ipCheck = await this.ipIntel.check(event.ipAddress || '0.0.0.0');

        // 1. Calculate Risk Score
        // Inject new signals into context
        const context = {
            ...event,
            behaviorScore: behavior.score,
            ipRiskScore: ipCheck.score
        };
        const assessment = await this.riskEngine.evaluate(userId, context);

        // 2. Fraud Checks (if trade related)
        if (event.action === 'TRADE_INIT') {
            const isCollusion = await this.fraudDetector.detectCollusion(userId, event.details?.counterpartyId);
            if (isCollusion) {
                assessment.score += 50;
                assessment.factors.push('POTENTIAL_COLLUSION');
                assessment.level = RiskLevel.RESTRICT;
            }

            const isRingFraud = await this.fraudDetector.detectRingFraud(userId);
            if (isRingFraud) {
                assessment.score += 80; // High severity
                assessment.factors.push('DETECTED_RING_FRAUD');
                assessment.level = RiskLevel.LOCKDOWN; // Immediate block
            }
        }

        if (event.action === 'LOGIN' || event.action === 'LOGIN_FAILURE') {
            const isLowAndSlow = await this.fraudDetector.detectLowAndSlowAttack(userId);
            if (isLowAndSlow) {
                assessment.score += 40;
                assessment.factors.push('LOW_AND_SLOW_ATTACK');
                assessment.level = RiskLevel.FRICTION; // Force 2FA or CAPTCHA
            }
        }

        // 3. Log to Immutable "Black Box"
        await this.auditLogger.log({
            ...event,
            details: { ...event.details, riskAssessment: assessment, behavior, ipCheck }
        }, assessment.score);

        // 4. Policy Enforcement
        if (assessment.level === RiskLevel.LOCKDOWN) {
            this.logger.error(`BLOCKING ACTION for user ${userId}: Risk Level LOCKDOWN`);
            throw new Error('Security Lockdown: Action blocked. Please contact support.');
        }

        if (assessment.level === RiskLevel.RESTRICT) {
            // In a real app, we might allow but flag for manual review, or require 2FA.
            this.logger.warn(`Restricted Action for user ${userId}. Proceeding with flags.`);
        }

        return true; // Allow action
    }
    async flagContentForReview(userId: string, type: 'PHONE_NUMBER_IN_IMAGE' | 'PROHIBITED_CONTENT', evidenceUrl: string, detectedText?: string): Promise<void> {
        // Create a Moderation Flag for Admin Review
        await this.prisma.contentModerationFlag.create({
            data: {
                reportedByUserId: userId, // User reported themselves via auto-detection
                reason: `AI Detection: ${type}`,
                category: 'PRIVACY_VIOLATION',
                severity: 'HIGH_RISK',
                evidenceUrl: evidenceUrl,
                matchedKeywords: detectedText ? JSON.stringify({ detectedText }) : null,
                status: 'PENDING'
            }
        });

        this.logger.warn(`Content flagged for review: User ${userId}, Type ${type}`);
    }

    // Called by Admin to confirm the ban
    async executeBanForFlag(flagId: string, adminId: string): Promise<void> {
        const flag = await this.prisma.contentModerationFlag.findUnique({ where: { id: flagId } });
        if (!flag || !flag.reportedByUserId) return;

        const userId = flag.reportedByUserId;
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) return;

        const newStrikeCount = user.moderationStrikes + 1;
        let banDurationHours = 0;
        let banReason = '';
        let isPermaBan = false;

        if (newStrikeCount === 1) {
            banDurationHours = 24;
            banReason = 'First Warning: Posting personal contact info (phone numbers) in public images is prohibited. 24-hour suspension.';
        } else if (newStrikeCount >= 2) {
            isPermaBan = true;
            banReason = 'Final Warning Ignored: Permanent ban for repeated safety violations.';
        }

        const banExpiresAt = isPermaBan ? null : new Date(Date.now() + banDurationHours * 60 * 60 * 1000);

        // Update User
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                moderationStrikes: newStrikeCount,
                isBanned: true,
                bannedAt: new Date(),
                banReason,
                banExpiresAt
            }
        });

        // Update Flag Status
        await this.prisma.contentModerationFlag.update({
            where: { id: flagId },
            data: {
                status: 'REJECTED', // Content rejected, user punished
                reviewedBy: adminId,
                reviewedAt: new Date(),
                reviewNotes: `Ban Confirmed. Strike ${newStrikeCount}.`
            }
        });

        await this.auditLogger.log({
            action: 'USER_BANNED',
            userId,
            adminId,
            details: { flagId, strikes: newStrikeCount, duration: isPermaBan ? 'PERMANENT' : banDurationHours + 'h' }
        }, 100);
    }
}
