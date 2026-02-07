import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type SystemMode = 'NORMAL' | 'SAFE' | 'FROZEN' | 'READ_ONLY';

export interface KillSwitches {
    disableUploads: boolean;
    disableTrades: boolean;
    disableSignup: boolean;
    disableMessaging: boolean;
    disableSearch: boolean;
}

@Injectable()
export class SystemStateService {
    private readonly logger = new Logger(SystemStateService.name);

    private currentMode: SystemMode = 'NORMAL';

    // Default: Everything enabled (disable flags = false)
    private killSwitches: KillSwitches = {
        disableUploads: false,
        disableTrades: false,
        disableSignup: false,
        disableMessaging: false,
        disableSearch: false
    };

    constructor(private prisma: PrismaService) {
        this.logger.log(`System initialized in ${this.currentMode} mode.`);
    }

    getMode(): SystemMode {
        return this.currentMode;
    }

    setMode(mode: SystemMode) {
        this.logger.warn(`Global System Mode changing: ${this.currentMode} -> ${mode}`);
        this.currentMode = mode;
        this.applyModeDefaults(mode);
    }

    getKillSwitches(): KillSwitches {
        return this.killSwitches;
    }

    toggleKillSwitch(feature: keyof KillSwitches, isDisabled: boolean) {
        this.logger.warn(`Kill Switch for ${feature} set to ${isDisabled}`);
        this.killSwitches[feature] = isDisabled;
    }

    /**
     * Fetches public system configuration (safe for frontend exposure)
     */
    async getPublicConfig() {
        // We assume ID 1 is the singleton config row
        let config = await this.prisma.systemConfig.findUnique({
            where: { id: 1 }
        });

        // Auto-seed if missing
        if (!config) {
            this.logger.warn('System Config missing! Seeding default...');
            config = await this.prisma.systemConfig.create({
                data: {
                    id: 1,
                    whishPhoneNumber: '71023083', // Default falback
                    isFrozen: false
                }
            });
        }

        return {
            whishPhoneNumber: config.whishPhoneNumber,
            omtPhoneNumber: config.omtPhoneNumber,
            isCrisisActive: config.isCrisisActive,
            ambassadorTradeThreshold: (config as any).ambassadorTradeThreshold || 100,
            legalEntityId: (config as any).legalEntityId
        };
    }

    private applyModeDefaults(mode: SystemMode) {
        switch (mode) {
            case 'NORMAL':
                this.resetKillSwitches();
                break;
            case 'SAFE':
                this.killSwitches.disableUploads = true;
                this.killSwitches.disableSignup = true;
                break;
            case 'FROZEN':
                this.killSwitches.disableUploads = true;
                this.killSwitches.disableTrades = true;
                this.killSwitches.disableSignup = true;
                this.killSwitches.disableMessaging = true;
                break;
            case 'READ_ONLY':
                // Implicitly handled by guards blocking all writes, but we can also set flags
                this.killSwitches.disableUploads = true;
                this.killSwitches.disableTrades = true;
                this.killSwitches.disableSignup = true;
                this.killSwitches.disableMessaging = true;
                break;
        }
    }

    private resetKillSwitches() {
        Object.keys(this.killSwitches).forEach(key => {
            this.killSwitches[key as keyof KillSwitches] = false;
        });
    }
}
