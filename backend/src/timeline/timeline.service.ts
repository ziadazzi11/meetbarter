import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Timeline Service - Manages immutable trade timeline progression
 * States must follow this exact order:
 * OFFER_SENT → OFFER_ACCEPTED → ITEMS_LOCKED → MEETUP_AGREED → TRADE_COMPLETED → TRADE_VERIFIED
 */
@Injectable()
export class TimelineService {
    private readonly TIMELINE_STATES = [
        'OFFER_SENT',
        'OFFER_ACCEPTED',
        'ITEMS_LOCKED',
        'MEETUP_AGREED',
        'TRADE_COMPLETED',
        'TRADE_VERIFIED'
    ];

    constructor(private prisma: PrismaService) { }

    /**
     * Get timeline for a specific trade
     */
    async getTimelineByTradeId(tradeId: string) {
        return this.prisma.tradeTimeline.findMany({
            where: { tradeId },
            orderBy: { timestamp: 'asc' }
        });
    }

    /**
     * Add a new timeline event - validates state progression
     */
    async addTimelineEvent(
        tradeId: string,
        state: string,
        metadata?: Record<string, any>
    ) {
        // Validate state
        if (!this.TIMELINE_STATES.includes(state)) {
            throw new BadRequestException(`Invalid timeline state: ${state}`);
        }

        // Get current timeline
        const currentTimeline = await this.getTimelineByTradeId(tradeId);

        // Validate state progression
        if (currentTimeline.length > 0) {
            const lastState = currentTimeline[currentTimeline.length - 1].state;
            const lastStateIndex = this.TIMELINE_STATES.indexOf(lastState);
            const newStateIndex = this.TIMELINE_STATES.indexOf(state);

            // Can't go backwards or skip states
            if (newStateIndex <= lastStateIndex) {
                throw new BadRequestException(
                    `Invalid state progression: Cannot move from ${lastState} to ${state}`
                );
            }

            if (newStateIndex > lastStateIndex + 1) {
                throw new BadRequestException(
                    `Cannot skip states. Expected ${this.TIMELINE_STATES[lastStateIndex + 1]} but got ${state}`
                );
            }
        } else {
            // First event must be OFFER_SENT
            if (state !== 'OFFER_SENT') {
                throw new BadRequestException('First timeline state must be OFFER_SENT');
            }
        }

        // Create timeline event
        return this.prisma.tradeTimeline.create({
            data: {
                tradeId,
                state,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        });
    }

    /**
     * Get current state for a trade
     */
    async getCurrentState(tradeId: string): Promise<string | null> {
        const timeline = await this.getTimelineByTradeId(tradeId);
        if (timeline.length === 0) return null;
        return timeline[timeline.length - 1].state;
    }

    /**
     * Check if trade has reached a specific state
     */
    async hasReachedState(tradeId: string, state: string): Promise<boolean> {
        const timeline = await this.getTimelineByTradeId(tradeId);
        return timeline.some(event => event.state === state);
    }
}
