
import { Injectable } from '@nestjs/common';

@Injectable()
export class BehaviorAnalyzer {
    // 5. Behavioral Intelligence (Passive Signals)
    // Interaction rhythm, navigation patterns, etc.

    async analyze(userId: string, context: any): Promise<{ score: number, flags: string[] }> {
        const flags: string[] = [];
        let behaviorScore = 0; // 0 = Normal, higher = suspicious

        // Mock Logic: Check for superhuman speed (Bot behavior)
        if (context.timeOnPage && context.timeOnPage < 500) { // < 0.5s
            behaviorScore += 20;
            flags.push('SUPERHUMAN_SPEED');
        }

        // Mock Logic: Check for erratic mouse movement (or lack thereof for bots)
        // In backend, we'd receive this as telemetry data in 'context'

        return { score: behaviorScore, flags };
    }
}
