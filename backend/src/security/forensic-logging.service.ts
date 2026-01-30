import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ForensicLoggingService {
    private readonly logger = new Logger(ForensicLoggingService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Records a non-repudiable audit trail for critical system events.
     * Layer VIII: Forensic Logging
     */
    async logCriticalEvent(action: string, adminId: string, details: any, userId?: string) {
        try {
            const timestamp = new Date();
            const logEntry = {
                action: action.toUpperCase(),
                adminId,
                userId,
                details: JSON.stringify(details),
                createdAt: timestamp,
                // In a production environment, we would also sign this log entry or push it to an immutable ledger/WORM storage.
            };

            await this.prisma.auditLog.create({
                data: logEntry,
            });

            this.logger.log(`Forensic Log Created: ${action} by ${adminId}`);
        } catch (error) {
            this.logger.error(`CRITICAL: Forensic Logging Failed! [${action}] - ${error.message}`);
            // In high-security systems, we might choose to crash the process if logging fails to prevent "blind" operations.
        }
    }
}
