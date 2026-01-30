import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';

export type AdsSignalType =
    | 'HTTP_REQUEST'
    | 'AUTH_ATTEMPT'
    | 'TRADE_FLOW'
    | 'UPLOAD_EVENT'
    | 'VP_MOVEMENT'
    | 'HONEYPOT_TRIGGER'
    | 'RECON_PROBE'
    | 'CANARY_ACCESS'
    | 'VAULT_RECON_ATTEMPT'
    | 'PARAMETER_PROBING'
    | 'ENDPOINT_ENUMERATION'
    | 'EXCESSIVE_RETRIES';

export interface AdsSignal {
    type: AdsSignalType;
    source?: string; // IP, UserId, or System Component
    timestamp: number;
    metadata: Record<string, any>;
    riskWeight?: number; // Pre-calculated weight (optional)
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; // Signal severity
    userId?: number | null; // User ID if available
}

@Injectable()
export class SignalIngestionService {
    private readonly logger = new Logger(SignalIngestionService.name);
    private signalStream = new Subject<AdsSignal>();

    constructor() { }

    /**
     * Ingest a raw signal from any system component.
     */
    emitSignal(signal: AdsSignal) {
        // Enforce timestamp if missing
        if (!signal.timestamp) signal.timestamp = Date.now();

        // Debug Log (Verbose mode only in prod)
        // this.logger.debug(`Signal Ingested: [${signal.type}] from ${signal.source}`);

        this.signalStream.next(signal);
    }

    /**
     * Convenience method for ingesting signals with simplified parameters
     */
    ingestSignal(params: {
        type: AdsSignalType;
        severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        userId?: number | null;
        metadata: Record<string, any>;
    }) {
        this.emitSignal({
            type: params.type,
            severity: params.severity || 'MEDIUM',
            userId: params.userId,
            source: params.userId ? `user:${params.userId}` : 'anonymous',
            timestamp: Date.now(),
            metadata: params.metadata,
        });
    }

    /**
     * Subscribe to the signal stream (Used by Risk Engine)
     */
    getStream() {
        return this.signalStream.asObservable();
    }
}
