import { Injectable, Logger } from '@nestjs/common';
import { AdsSignal } from './signal-ingestion.service';

export interface RiskProfile {
    score: number; // 0 - 100
    factors: string[];
    lastUpdate: number;
}

@Injectable()
export class RiskEngineService {
    private readonly logger = new Logger(RiskEngineService.name);

    // In-memory risk tracking (Redis in production)
    private riskMap: Map<string, RiskProfile> = new Map();

    evaluateSignal(signal: AdsSignal): RiskProfile {
        const profile = this.getOrInitProfile(signal.source);

        // --- 🧠 HEURISTIC RULES ---

        // Rule 1: Velocity Check (HTTP Flood)
        if (signal.type === 'HTTP_REQUEST') {
            // Logic: If signals come too fast, increase risk
            // (Simplified implementation: relying on ADE or rate-limit counters passed in metadata)
            if (signal.metadata.rateLimitRemaining < 5) {
                profile.score += 10;
                profile.factors.push('RATE_LIMIT_NEAR');
            }
        }

        // Rule 2: Auth Velocity
        if (signal.type === 'AUTH_ATTEMPT') {
            if (signal.metadata.success === false) {
                profile.score += 20;
                profile.factors.push('AUTH_FAILURE');
            }
            if (signal.metadata.isNewDevice) {
                profile.score += 5;
            }
        }

        // Rule 3: Economic Anomaly
        if (signal.type === 'VP_MOVEMENT') {
            if (signal.metadata.amount > 5000) {
                profile.score += 50; // Immediate High Risk
                profile.factors.push('LARGE_VP_MOVEMENT');
            }
        }

        // Rule 4: Honeypot Trigger (Instance Ban Strategy)
        if (signal.type === 'HONEYPOT_TRIGGER') {
            profile.score += 100;
            profile.factors.push('HONEYPOT_TRIPWIRE');
            profile.factors.push(signal.metadata.trapType);
        }

        // Rule 5: Reconnaissance Probe
        if (signal.type === 'RECON_PROBE') {
            profile.score += 20;
            profile.factors.push('SUSPICIOUS_PROBE');
        }

        // Rule 6: Canary Endpoint Access (CRITICAL)
        if (signal.type === 'CANARY_ACCESS') {
            profile.score += 50;
            profile.factors.push('CANARY_ENDPOINT_ACCESS');
            this.logger.warn(`🚨 CANARY ACCESS DETECTED: ${signal.source || signal.userId}`);
        }

        // Rule 7: Vault Reconnaissance Attempt (SOVEREIGN CORE BREACH)
        if (signal.type === 'VAULT_RECON_ATTEMPT') {
            profile.score += 80; // Near-instant ban threshold
            profile.factors.push('VAULT_RECON_ATTEMPT');
            profile.factors.push('SOVEREIGN_CORE_BREACH');
            this.logger.error(`🔴 VAULT RECON ATTEMPT: ${signal.source || signal.userId}`);
        }

        // Rule 8: Parameter Probing (Fuzzing Detection)
        if (signal.type === 'PARAMETER_PROBING') {
            profile.score += 15;
            profile.factors.push('PARAMETER_FUZZING');
        }

        // Rule 9: Endpoint Enumeration (Scanner Detection)
        if (signal.type === 'ENDPOINT_ENUMERATION') {
            profile.score += 20;
            profile.factors.push('ENDPOINT_SCANNING');
        }

        // Rule 10: Excessive Retries (Brute Force Detection)
        if (signal.type === 'EXCESSIVE_RETRIES') {
            profile.score += 10;
            profile.factors.push('EXCESSIVE_RETRIES');
        }

        // Decay Logic (Simple Linear Decay every interaction)
        // If last update was > 1 min ago, decay score
        const now = Date.now();
        if (now - profile.lastUpdate > 60000) {
            profile.score = Math.max(0, profile.score - 5);
        }

        // Cap Score
        profile.score = Math.min(100, profile.score);
        profile.lastUpdate = now;

        this.riskMap.set(signal.source, profile);
        return profile;
    }

    private getOrInitProfile(source: string): RiskProfile {
        if (!this.riskMap.has(source)) {
            this.riskMap.set(source, {
                score: 0,
                factors: [],
                lastUpdate: Date.now()
            });
        }
        return this.riskMap.get(source)!;
    }

    getRiskScore(source: string): number {
        return this.riskMap.get(source)?.score || 0;
    }
}
