import { Injectable, Logger } from '@nestjs/common';

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

    constructor() {
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
