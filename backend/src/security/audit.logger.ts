
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityEvent } from './security.types';
import { LedgerService } from './ledger.service';

@Injectable()
export class AuditLogger {
    constructor(
        private prisma: PrismaService,
        private ledger: LedgerService
    ) { }

    /**
     * The "Black Box" Recorder.
     * Writes an immutable, hash-chained log entry.
     */
    async log(event: SecurityEvent, riskScore: number = 0) {
        try {
            // 1. Fetch previous log for chaining (Blockchain style)
            const lastLog = await this.prisma.auditLog.findFirst({
                orderBy: { createdAt: 'desc' }
            });
            const prevHash = lastLog?.hash || 'GENESIS_HASH';

            // 2. Prepare payload (log only, not used for hash calculation here as ledger service handles it)
            // const dataToHash = { ... };

            // 3. Calculate Integrity Hash via Ledger Service
            const hash = this.ledger.calculateHash(prevHash, {
                action: event.action,
                userId: event.userId,
                details: JSON.stringify(event.details)
            });

            // 4. Write to DB
            await this.prisma.auditLog.create({
                data: {
                    action: event.action,
                    userId: event.userId,
                    details: JSON.stringify(event.details),
                    ipAddress: event.ipAddress,
                    userAgent: event.userAgent,
                    riskScore: riskScore,
                    previousHash: prevHash,
                    hash: hash
                }
            });

            if (riskScore > 80) {
                console.warn(`[SECURITY ALERT] High Risk Action Logged: ${event.action} (Score: ${riskScore})`);
            }

        } catch (error) {
            console.error('CRITICAL: FAILED TO WRITE AUDIT LOG', error);
            // In a real banking app, we might kill the process here to satisfy "Fail Closed" security policy.
        }
    }
}
