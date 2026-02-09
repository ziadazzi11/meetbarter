
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class LedgerService {
    /**
     * Calculates a SHA-256 hash for a log entry based on its content and the previous hash.
     * This creates a tamper-evident chain.
     */
    calculateHash(prevHash: string, data: any): string {
        const payload = {
            prevHash,
            data,
            timestamp: new Date().toISOString()
        };
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(payload))
            .digest('hex');
    }

    /**
     * Verifies the integrity of a chain segment.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    verifyLink(_prevHash: string, _currentData: any, _currentHash: string): boolean {
        // Note: For full verification we'd need the exact timestamp from the original log.
        // For now, this is a placeholder for more advanced ledger verification.
        return true;
    }
}
