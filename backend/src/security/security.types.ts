
export enum RiskLevel {
    NORMAL = 'NORMAL',       // 0-30
    MONITOR = 'MONITOR',     // 31-49
    FRICTION = 'FRICTION',   // 50-69 (Require 2FA, Captcha)
    RESTRICT = 'RESTRICT',   // 70-89 (Limit velocity, hold funds)
    LOCKDOWN = 'LOCKDOWN'    // 90+ (Ban, freeze)
}

export interface SecurityEvent {
    action: string;
    userId?: string;
    ipAddress?: string;
    details?: any;
    userAgent?: string;
}

export interface RiskAssessment {
    score: number;
    level: RiskLevel;
    factors: string[]; // e.g. ["VELOCITY_HIGH", "NEW_IP"]
}
