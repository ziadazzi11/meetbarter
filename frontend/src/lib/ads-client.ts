import { API_BASE_URL } from '@/config/api';
import { createHash } from 'crypto';

interface ChallengeResponse {
    challengeId: string;
    nonce: string;
    expiresAt: number;
    instructions: string;
}

interface TokenResponse {
    success: boolean;
    tokenId?: string;
    expiresAt?: number;
    error?: string;
    instructions?: string;
}

/**
 * ADS Client - Protocol Shaping Implementation
 * 
 * Purpose: Client-side handshake protocol for anti-reconnaissance
 * Classification: AMBER (Strategic Defense Layer)
 * 
 * Flow:
 * 1. Request challenge from server
 * 2. Hash nonce with SHA256
 * 3. Verify challenge and get token
 * 4. Use token in X-Handshake-Token header for protected requests
 */
export class AdsClient {
    private baseUrl: string;
    private tokenCache: Map<string, { tokenId: string; expiresAt: number }> = new Map();

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    /**
     * Get or create handshake token
     * Caches valid tokens to avoid unnecessary handshakes
     */
    private async getHandshakeToken(sessionId?: string): Promise<string | null> {
        const cacheKey = sessionId || 'default';
        const cached = this.tokenCache.get(cacheKey);

        // Return cached token if still valid
        if (cached && Date.now() < cached.expiresAt - 10000) { // 10s buffer
            return cached.tokenId;
        }

        // Perform handshake
        try {
            // Step 1: Get challenge
            const challengeRes = await fetch(`${this.baseUrl}/v1/auth-sync/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            });

            if (!challengeRes.ok) {
                console.error('Failed to initialize handshake');
                return null;
            }

            const challenge: ChallengeResponse = await challengeRes.json();

            // Step 2: Hash nonce (SHA256)
            const signature = await this.hashNonce(challenge.nonce);

            // Step 3: Verify and get token
            const tokenRes = await fetch(`${this.baseUrl}/v1/auth-sync/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengeId: challenge.challengeId,
                    signature,
                    sessionId,
                }),
            });

            if (!tokenRes.ok) {
                console.error('Failed to verify handshake');
                return null;
            }

            const tokenData: TokenResponse = await tokenRes.json();

            if (!tokenData.success || !tokenData.tokenId) {
                console.error('Handshake verification failed:', tokenData.error);
                return null;
            }

            // Cache token
            this.tokenCache.set(cacheKey, {
                tokenId: tokenData.tokenId,
                expiresAt: tokenData.expiresAt || Date.now() + 300000,
            });

            return tokenData.tokenId;
        } catch (error) {
            console.error('Handshake error:', error);
            return null;
        }
    }

    /**
     * Hash nonce using SHA256
     * Browser-compatible implementation
     */
    private async hashNonce(nonce: string): Promise<string> {
        // Browser environment: Use SubtleCrypto API
        if (typeof window !== 'undefined' && window.crypto?.subtle) {
            const msgUint8 = new TextEncoder().encode(nonce);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        // Node environment: Use crypto module
        return createHash('sha256').update(nonce).digest('hex');
    }

    /**
     * Secure POST request with handshake protocol
     * 
     * @param endpoint - API endpoint (e.g., '/trades/create')
     * @param data - Request payload
     * @param requireHandshake - Whether to use handshake protocol (default: false)
     */
    async post(
        endpoint: string,
        data: unknown,
        options: { requireHandshake?: boolean; sessionId?: string } = {}
    ) {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            // Add handshake token if required
            if (options.requireHandshake) {
                const token = await this.getHandshakeToken(options.sessionId);
                if (token) {
                    headers['X-Handshake-Token'] = token;
                } else {
                    console.warn('Failed to obtain handshake token, proceeding without it');
                }
            }

            const res = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
                credentials: 'include', // Include cookies
            });

            if (!res.ok) {
                try {
                    const err = await res.json();
                    throw new Error(err.message || 'Request Failed');
                } catch {
                    throw new Error(`Request Failed: ${res.status}`);
                }
            }

            return await res.json();
        } catch (error) {
            console.error('ADS Network Error:', error);
            throw error;
        }
    }

    /**
     * Secure GET request
     */
    async get(endpoint: string, options: { requireHandshake?: boolean } = {}) {
        try {
            const headers: Record<string, string> = {};

            if (options.requireHandshake) {
                const token = await this.getHandshakeToken();
                if (token) {
                    headers['X-Handshake-Token'] = token;
                }
            }

            const res = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'GET',
                headers,
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error(`Request Failed: ${res.status}`);
            }

            return await res.json();
        } catch (error) {
            console.error('ADS Network Error:', error);
            throw error;
        }
    }

    /**
     * Clear cached tokens (e.g., on logout)
     */
    clearTokenCache() {
        this.tokenCache.clear();
    }
}

export const adsClient = new AdsClient();
