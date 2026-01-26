import { Injectable } from '@nestjs/common';

@Injectable()
export class VelocityGuard {
    // In-memory store for MVP (Map<userId, timestamps[]>)
    // In production, use Redis
    private requestLog: Map<string, number[]> = new Map();

    private readonly LIMIT = 10; // 10 requests
    private readonly WINDOW_MS = 60 * 1000; // per 1 minute

    check(userId: string): number {
        const now = Date.now();
        const timestamps = this.requestLog.get(userId) || [];

        // Filter out old timestamps
        const recentRequests = timestamps.filter(t => now - t < this.WINDOW_MS);

        // Add current request
        recentRequests.push(now);
        this.requestLog.set(userId, recentRequests);

        return recentRequests.length;
    }
}
