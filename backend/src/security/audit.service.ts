import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Log a security-critical action with integrity hashing (Blockchain-style).
     * @param action The action type (e.g., 'FREEZE_SYSTEM')
     * @param details Object containing relevant details
     * @param userId Optional User ID who performed the action
     */
    async log(action: string, details: any, userId?: string, ipAddress?: string, userAgent?: string) {
        try {
            // 1. Fetch the Last Log (to get previous hash)
            // We use findFirst ordered by createdAt DESC
            const lastLog = await this.prisma.auditLog.findFirst({
                orderBy: { createdAt: 'desc' }
            });

            const previousHash = lastLog?.hash || 'GENESIS_HASH_MEETBARTER_2026';
            const timestamp = new Date().toISOString();
            const detailsString = JSON.stringify(details);

            // 2. Calculate New Hash
            // Structure: SHA256(previousHash + action + userId + details + timestamp)
            const payload = `${previousHash}|${action}|${userId || 'SYSTEM'}|${detailsString}|${timestamp}`;
            const currentHash = crypto.createHash('sha256').update(payload).digest('hex');

            // 3. Persist Log
            await this.prisma.auditLog.create({
                data: {
                    action,
                    details: detailsString,
                    userId,
                    ipAddress,
                    userAgent,
                    previousHash,
                    hash: currentHash,
                    createdAt: new Date(timestamp) // Ensure exact timestamp sync
                }
            });

            // this.logger.debug(`🔒 Audit Logged: ${action} [Hash: ${currentHash.substr(0, 8)}...]`);

        } catch (error) {
            // CRITICAL: If audit fails, we should probably scream, but not crash the app logic if possible.
            this.logger.error(`Failed to create tamper-evident audit log: ${error.message}`);
        }
    }

    /**
     * Verify the integrity of the audit log chain.
     * Returns true if valid, or the ID of the first corrupted record.
     */
    async verifyChain(): Promise<boolean | string> {
        // Fetch all logs ordered by time (streaming or batches in real prod)
        // For simplicity in Phase V, fetching last 100 for check
        const logs = await this.prisma.auditLog.findMany({
            orderBy: { createdAt: 'asc' },
            take: 1000
        });

        if (logs.length === 0) return true;

        let previousHash = 'GENESIS_HASH_MEETBARTER_2026';

        for (const log of logs) {
            // 1. Check Link: Does log.previousHash match our tracker?
            if (log.previousHash !== previousHash) {
                this.logger.error(`🚨 INTEGRITY FAILURE: Log ${log.id} has broken chain link.`);
                return log.id;
            }

            // 2. Check Content: Does re-hashing produce log.hash?
            const payload = `${previousHash}|${log.action}|${log.userId || 'SYSTEM'}|${log.details}|${log.createdAt.toISOString()}`;
            const calculatedHash = crypto.createHash('sha256').update(payload).digest('hex');

            if (calculatedHash !== log.hash) {
                this.logger.error(`🚨 INTEGRITY FAILURE: Log ${log.id} has tampered content.`);
                return log.id;
            }

            previousHash = log.hash;
        }

        return true;
    }
}
