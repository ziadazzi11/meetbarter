import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';

/**
 * Protocol Shaping Service - Handshake-Based Request Validation
 * 
 * Purpose: Replace predictable REST patterns with state-based flows
 * Classification: AMBER (Strategic Defense Layer)
 * 
 * Strategy:
 * - Implement handshake protocol: INIT → CHALLENGE → TOKEN → ACTION → CONFIRM
 * - Each step is time-bound, session-bound, nonce-bound
 * - Static replay attacks fail automatically
 * - Prevents reconnaissance tools from mapping business logic
 */

export interface HandshakeChallenge {
    challengeId: string;
    nonce: string;
    timestamp: number;
    expiresAt: number;
    sessionId?: string;
}

export interface HandshakeToken {
    tokenId: string;
    challengeId: string;
    signature: string;
    issuedAt: number;
    expiresAt: number;
}

@Injectable()
export class ProtocolShapingService {
    private readonly logger = new Logger(ProtocolShapingService.name);

    // In-memory storage (Redis in production)
    private challenges: Map<string, HandshakeChallenge> = new Map();
    private tokens: Map<string, HandshakeToken> = new Map();

    // Configuration
    private readonly CHALLENGE_TTL_MS = 60000; // 1 minute
    private readonly TOKEN_TTL_MS = 300000; // 5 minutes
    private readonly NONCE_LENGTH = 32;

    /**
     * STEP 1: Initialize handshake - Generate challenge
     * 
     * @param sessionId - Optional session identifier
     * @returns Challenge object with nonce
     */
    initiateHandshake(sessionId?: string): HandshakeChallenge {
        const challengeId = this.generateId();
        const nonce = this.generateNonce();
        const timestamp = Date.now();
        const expiresAt = timestamp + this.CHALLENGE_TTL_MS;

        const challenge: HandshakeChallenge = {
            challengeId,
            nonce,
            timestamp,
            expiresAt,
            sessionId,
        };

        this.challenges.set(challengeId, challenge);

        // Cleanup expired challenges
        this.cleanupExpiredChallenges();

        this.logger.debug(`Handshake initiated: ${challengeId}`);
        return challenge;
    }

    /**
     * STEP 2: Verify challenge response and issue token
     * 
     * @param challengeId - Challenge identifier
     * @param clientSignature - Client's signature of the challenge
     * @param sessionId - Session identifier (must match challenge)
     * @returns Token if verification succeeds, null otherwise
     */
    verifyAndIssueToken(
        challengeId: string,
        clientSignature: string,
        sessionId?: string,
    ): HandshakeToken | null {
        const challenge = this.challenges.get(challengeId);

        // Validation 1: Challenge exists
        if (!challenge) {
            this.logger.warn(`Challenge not found: ${challengeId}`);
            return null;
        }

        // Validation 2: Challenge not expired
        if (Date.now() > challenge.expiresAt) {
            this.logger.warn(`Challenge expired: ${challengeId}`);
            this.challenges.delete(challengeId);
            return null;
        }

        // Validation 3: Session match (if provided)
        if (challenge.sessionId && challenge.sessionId !== sessionId) {
            this.logger.warn(`Session mismatch for challenge: ${challengeId}`);
            return null;
        }

        // Validation 4: Verify signature (simplified - in production use HMAC)
        const expectedSignature = this.hashNonce(challenge.nonce);
        if (clientSignature !== expectedSignature) {
            this.logger.warn(`Invalid signature for challenge: ${challengeId}`);
            return null;
        }

        // Issue token
        const tokenId = this.generateId();
        const timestamp = Date.now();
        const token: HandshakeToken = {
            tokenId,
            challengeId,
            signature: this.generateTokenSignature(tokenId, challengeId),
            issuedAt: timestamp,
            expiresAt: timestamp + this.TOKEN_TTL_MS,
        };

        this.tokens.set(tokenId, token);

        // Consume challenge (one-time use)
        this.challenges.delete(challengeId);

        this.logger.debug(`Token issued: ${tokenId} for challenge: ${challengeId}`);
        return token;
    }

    /**
     * STEP 3: Validate token for action execution
     * 
     * @param tokenId - Token identifier
     * @param action - Action being performed (for audit)
     * @returns True if token is valid, false otherwise
     */
    validateToken(tokenId: string, action?: string): boolean {
        const token = this.tokens.get(tokenId);

        // Validation 1: Token exists
        if (!token) {
            this.logger.warn(`Token not found: ${tokenId}`);
            return false;
        }

        // Validation 2: Token not expired
        if (Date.now() > token.expiresAt) {
            this.logger.warn(`Token expired: ${tokenId}`);
            this.tokens.delete(tokenId);
            return false;
        }

        // Validation 3: Signature integrity
        const expectedSignature = this.generateTokenSignature(
            token.tokenId,
            token.challengeId,
        );
        if (token.signature !== expectedSignature) {
            this.logger.warn(`Token signature mismatch: ${tokenId}`);
            this.tokens.delete(tokenId);
            return false;
        }

        this.logger.debug(`Token validated: ${tokenId} for action: ${action || 'unknown'}`);
        return true;
    }

    /**
     * STEP 4: Consume token (one-time use for critical actions)
     * 
     * @param tokenId - Token identifier
     * @returns True if token was consumed, false if invalid
     */
    consumeToken(tokenId: string): boolean {
        if (!this.validateToken(tokenId)) {
            return false;
        }

        this.tokens.delete(tokenId);
        this.logger.debug(`Token consumed: ${tokenId}`);
        return true;
    }

    /**
     * Get challenge by ID (for debugging/audit)
     */
    getChallenge(challengeId: string): HandshakeChallenge | null {
        return this.challenges.get(challengeId) || null;
    }

    /**
     * Get token by ID (for debugging/audit)
     */
    getToken(tokenId: string): HandshakeToken | null {
        return this.tokens.get(tokenId) || null;
    }

    /**
     * Generate unique identifier
     */
    private generateId(): string {
        return randomBytes(16).toString('hex');
    }

    /**
     * Generate cryptographic nonce
     */
    private generateNonce(): string {
        return randomBytes(this.NONCE_LENGTH).toString('base64');
    }

    /**
     * Hash nonce for signature verification
     * In production: Use HMAC with secret key
     */
    private hashNonce(nonce: string): string {
        return createHash('sha256').update(nonce).digest('hex');
    }

    /**
     * Generate token signature
     * In production: Use HMAC with secret key
     */
    private generateTokenSignature(tokenId: string, challengeId: string): string {
        const data = `${tokenId}:${challengeId}`;
        return createHash('sha256').update(data).digest('hex');
    }

    /**
     * Cleanup expired challenges (garbage collection)
     */
    private cleanupExpiredChallenges(): void {
        const now = Date.now();
        for (const [id, challenge] of this.challenges.entries()) {
            if (now > challenge.expiresAt) {
                this.challenges.delete(id);
            }
        }
    }

    /**
     * Cleanup expired tokens (garbage collection)
     */
    private cleanupExpiredTokens(): void {
        const now = Date.now();
        for (const [id, token] of this.tokens.entries()) {
            if (now > token.expiresAt) {
                this.tokens.delete(id);
            }
        }
    }

    /**
     * Get system statistics (for monitoring)
     */
    getStats() {
        return {
            activeChallenges: this.challenges.size,
            activeTokens: this.tokens.size,
            challengeTTL: this.CHALLENGE_TTL_MS,
            tokenTTL: this.TOKEN_TTL_MS,
        };
    }
}
