import { Injectable, Logger } from '@nestjs/common';
import { AuditLogger } from './audit.logger';
import { RiskEngine } from './risk.engine';
import { FraudDetector } from './fraud.detector';
import { RiskLevel, SecurityEvent } from './security.types';
import { BehaviorAnalyzer } from './behavior.analyzer';
import { IpIntel } from './ip.intel';

@Injectable()
export class SecurityService {
    private readonly logger = new Logger(SecurityService.name);

    constructor(
        private auditLogger: AuditLogger,
        private riskEngine: RiskEngine,
        private fraudDetector: FraudDetector,
        private behaviorAnalyzer: BehaviorAnalyzer,
        private ipIntel: IpIntel
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
}
