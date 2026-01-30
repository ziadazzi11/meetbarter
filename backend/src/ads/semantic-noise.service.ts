import { Injectable } from '@nestjs/common';

/**
 * Semantic Noise Service - Response Obfuscation Layer
 * 
 * Purpose: Inject decoy fields into API responses to confuse reverse engineering
 * Classification: AMBER (Strategic Defense Layer)
 * 
 * Strategy:
 * - Add plausible but meaningless fields to responses
 * - Rotate field names periodically
 * - Ensure noise is semantically coherent but operationally useless
 * - Corrupt attacker intelligence gathering
 */
@Injectable()
export class SemanticNoiseService {
    /**
     * Decoy field pool - rotated periodically
     * These fields mean nothing but appear legitimate
     */
    private readonly DECOY_FIELDS = [
        'decoy_entropy',
        'sync_flag',
        'mirror_state',
        'cache_token',
        'session_hash',
        'validation_key',
        'integrity_check',
        'protocol_version',
        'handshake_id',
        'correlation_id',
        'trace_marker',
        'audit_ref',
        'flow_state',
        'checkpoint_id',
        'reconciliation_flag',
    ];

    /**
     * Inject semantic noise into response payload
     * 
     * @param response - Original response object
     * @returns Response with injected decoy fields
     */
    injectNoise(response: any): any {
        // Don't inject noise into error responses or primitives
        if (!response || typeof response !== 'object' || response instanceof Error) {
            return response;
        }

        // Clone response to avoid mutation
        const noisyResponse = { ...response };

        // Inject 2-4 random decoy fields
        const noiseCount = Math.floor(Math.random() * 3) + 2;
        const selectedFields = this.selectRandomFields(noiseCount);

        selectedFields.forEach(field => {
            noisyResponse[field] = this.generatePlausibleValue(field);
        });

        return noisyResponse;
    }

    /**
     * Select random decoy fields from the pool
     */
    private selectRandomFields(count: number): string[] {
        const shuffled = [...this.DECOY_FIELDS].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * Generate plausible values for decoy fields
     * Values must look real but be operationally meaningless
     */
    private generatePlausibleValue(fieldName: string): any {
        // Hash-like fields
        if (fieldName.includes('hash') || fieldName.includes('token') || fieldName.includes('key')) {
            return this.generateFakeHash();
        }

        // ID-like fields
        if (fieldName.includes('id') || fieldName.includes('ref') || fieldName.includes('marker')) {
            return this.generateFakeId();
        }

        // Boolean flags
        if (fieldName.includes('flag') || fieldName.includes('check')) {
            return Math.random() > 0.5;
        }

        // State fields
        if (fieldName.includes('state') || fieldName.includes('status')) {
            return this.generateFakeState();
        }

        // Version/protocol fields
        if (fieldName.includes('version') || fieldName.includes('protocol')) {
            return `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`;
        }

        // Default: random alphanumeric
        return this.generateFakeHash(8);
    }

    /**
     * Generate fake hash (looks like real hash but isn't)
     */
    private generateFakeHash(length: number = 16): string {
        const chars = '0123456789abcdef';
        let hash = '';
        for (let i = 0; i < length; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        return hash;
    }

    /**
     * Generate fake ID (looks like UUID but isn't)
     */
    private generateFakeId(): string {
        return `${this.generateFakeHash(8)}-${this.generateFakeHash(4)}-${this.generateFakeHash(4)}`;
    }

    /**
     * Generate fake state value
     */
    private generateFakeState(): string {
        const states = ['idle', 'pending', 'active', 'synced', 'validated', 'cached', 'ready'];
        return states[Math.floor(Math.random() * states.length)];
    }

    /**
     * Inject noise into array of responses
     */
    injectNoiseIntoArray(responses: any[]): any[] {
        if (!Array.isArray(responses)) {
            return responses;
        }

        return responses.map(item => this.injectNoise(item));
    }

    /**
     * Conditional noise injection based on user risk score
     * Higher risk users get more aggressive noise
     * 
     * @param response - Original response
     * @param riskScore - User's current risk score (0-100)
     */
    injectAdaptiveNoise(response: any, riskScore: number): any {
        // Low risk (0-30): No noise
        if (riskScore < 30) {
            return response;
        }

        // Medium risk (30-60): Light noise
        if (riskScore < 60) {
            return this.injectNoise(response);
        }

        // High risk (60-80): Heavy noise
        if (riskScore < 80) {
            const noisy = this.injectNoise(response);
            return this.injectNoise(noisy); // Double injection
        }

        // Critical risk (80+): Maximum confusion
        // Inject contradictory fields
        const noisy = this.injectNoise(response);
        noisy['_system_status'] = 'degraded';
        noisy['_maintenance_mode'] = true;
        noisy['_rate_limit_remaining'] = Math.floor(Math.random() * 10);
        return noisy;
    }
}
