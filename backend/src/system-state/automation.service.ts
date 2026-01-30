import { Injectable, Logger } from '@nestjs/common';
import { SystemStateService } from './system-state.service';

@Injectable()
export class AutomationService {
    private readonly logger = new Logger(AutomationService.name);

    // Simple in-memory counters (resetted every minute via simple checking)
    private counters: Record<string, number> = {};
    private lastReset = Date.now();

    constructor(private readonly systemState: SystemStateService) { }

    reportEvent(type: 'UPLOAD' | 'SIGNUP' | 'TRADE_CREATE') {
        this.checkReset();

        if (!this.counters[type]) this.counters[type] = 0;
        this.counters[type]++;

        this.checkThresholds(type, this.counters[type]);
    }

    private checkReset() {
        const now = Date.now();
        if (now - this.lastReset > 60000) { // 1 Minute Window
            this.counters = {};
            this.lastReset = now;
        }
    }

    private checkThresholds(type: string, count: number) {
        // 🛡️ Survival Thresholds (Solo Mode)
        // If these speeds are hit, it's likely an attack.

        if (type === 'SIGNUP' && count > 10) {
            this.logger.error(`🚨 AUTOMATION TRIGGER: Signup flood detected (${count}/min). Disabling Signups.`);
            this.systemState.toggleKillSwitch('disableSignup', true);
        }

        if (type === 'UPLOAD' && count > 20) {
            this.logger.error(`🚨 AUTOMATION TRIGGER: Upload flood detected (${count}/min). Disabling Uploads.`);
            this.systemState.toggleKillSwitch('disableUploads', true);
        }

        if (type === 'TRADE_CREATE' && count > 50) {
            this.logger.error(`🚨 AUTOMATION TRIGGER: Trade flood detected (${count}/min). Setting SAFE Mode.`);
            this.systemState.setMode('SAFE');
        }
    }
}
