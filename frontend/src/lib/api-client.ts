import { API_BASE_URL } from "@/config/api";

interface HandshakeChallenge {
    challengeId: string;
    nonce: string;
    expiresAt: number;
}

interface HandshakeToken {
    tokenId: string;
    expiresAt: number;
}

class HandshakeService {
    private token: HandshakeToken | null = null;
    private isHandshaking = false;
    private handshakePromise: Promise<string> | null = null;

    /**
     * Initialize the handshake process to obtain a secure token.
     * Handles concurrency to prevent multiple simultaneous handshakes.
     */
    async getSecureToken(): Promise<string> {
        // 1. Return existing valid token
        if (this.token && Date.now() < this.token.expiresAt - 5000) { // 5s buffer
            return this.token.tokenId;
        }

        // 2. Return existing promise if handshake is in progress
        if (this.isHandshaking && this.handshakePromise) {
            return this.handshakePromise;
        }

        // 3. Start new handshake
        this.isHandshaking = true;
        this.handshakePromise = this.performHandshake();

        try {
            const token = await this.handshakePromise;
            return token;
        } finally {
            this.isHandshaking = false;
            this.handshakePromise = null;
        }
    }

    /**
     * Performs the actual handshake protocol:
     * INIT -> SOLVE CHALLENGE -> VERIFY -> TOKEN
     */
    private async performHandshake(): Promise<string> {
        try {
            // Step 1: Init - Get Challenge
            const initRes = await fetch(`${API_BASE_URL}/v1/auth-sync/init`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });

            if (!initRes.ok) throw new Error("Handshake Init Failed");
            const challenge: HandshakeChallenge = await initRes.json();

            // Step 2: Solve Challenge (SHA-256 of Nonce)
            const signature = await this.hashNonce(challenge.nonce);

            // Step 3: Verify - Get Token
            const verifyRes = await fetch(`${API_BASE_URL}/v1/auth-sync/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    challengeId: challenge.challengeId,
                    signature: signature,
                }),
            });

            if (!verifyRes.ok) throw new Error("Handshake Verification Failed");
            const data = await verifyRes.json();

            if (!data.success || !data.tokenId) {
                throw new Error("Invalid Handshake Response");
            }

            this.token = {
                tokenId: data.tokenId,
                expiresAt: data.expiresAt,
            };

            return data.tokenId;
        } catch (error) {
            console.error("Critical Security Handshake Failed:", error);
            throw error;
        }
    }

    /**
     * Computes SHA-256 hash of the nonce using Web Crypto API.
     * Matches backend's expected signature logic.
     */
    private async hashNonce(nonce: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(nonce);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        return hashHex;
    }

    /**
     * Secure Fetch Wrapper
     * Automatically injects X-Handshake-Token header.
     * Optionally injects Authorization header if token provided.
     */
    async fetch(url: string, options: RequestInit = {}, authToken?: string): Promise<Response> {
        let handshakeToken: string;
        try {
            handshakeToken = await this.getSecureToken();
        } catch (e) {
            // Fallback: Try request without token if handshake fails (unlikely for protected routes)
            console.warn("Proceeding without handshake token due to error");
            return fetch(url, options);
        }

        const headers = new Headers(options.headers);
        headers.set("X-Handshake-Token", handshakeToken);

        if (authToken) {
            headers.set("Authorization", `Bearer ${authToken}`);
        }

        const config = {
            ...options,
            headers,
        };

        return fetch(url, config);
    }
}

export const apiClient = new HandshakeService();
