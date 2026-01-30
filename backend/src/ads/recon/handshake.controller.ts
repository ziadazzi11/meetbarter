import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ProtocolShapingService } from '../protocol-shaping.service';

/**
 * Handshake Controller - Public Endpoints for Protocol Flow
 * 
 * Purpose: Provide public endpoints for handshake protocol
 * Classification: AMBER (Strategic Defense Layer)
 * 
 * Flow:
 * 1. Client: POST /handshake/init → Get challenge
 * 2. Client: Solve challenge (hash nonce)
 * 3. Client: POST /handshake/verify → Get token
 * 4. Client: Use token in X-Handshake-Token header for protected requests
 */

@Controller('v1/auth-sync')
export class HandshakeController {
    constructor(private readonly protocolService: ProtocolShapingService) { }

    /**
     * STEP 1: Initialize handshake
     * 
     * POST /handshake/init
     * Body: { sessionId?: string }
     * Response: { challengeId, nonce, expiresAt }
     */
    @Post('init')
    @HttpCode(HttpStatus.OK)
    async initHandshake(@Body() body: { sessionId?: string }) {
        const challenge = this.protocolService.initiateHandshake(body.sessionId);

        return {
            challengeId: challenge.challengeId,
            nonce: challenge.nonce,
            expiresAt: challenge.expiresAt,
            instructions: 'Hash the nonce using SHA256 and send as signature',
        };
    }

    /**
     * STEP 2: Verify challenge and issue token
     * 
     * POST /handshake/verify
     * Body: { challengeId, signature, sessionId? }
     * Response: { tokenId, expiresAt }
     */
    @Post('verify')
    @HttpCode(HttpStatus.OK)
    async verifyChallenge(
        @Body() body: { challengeId: string; signature: string; sessionId?: string },
    ) {
        const token = this.protocolService.verifyAndIssueToken(
            body.challengeId,
            body.signature,
            body.sessionId,
        );

        if (!token) {
            return {
                success: false,
                error: 'Invalid challenge or signature',
            };
        }

        return {
            success: true,
            tokenId: token.tokenId,
            expiresAt: token.expiresAt,
            instructions: 'Use this token in X-Handshake-Token header',
        };
    }

    /**
     * DEBUG: Get handshake statistics
     * (Remove in production or protect with admin auth)
     */
    @Get('stats')
    getStats() {
        return this.protocolService.getStats();
    }
}
