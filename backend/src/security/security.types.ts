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
    adminId?: string;
}

export interface RiskAssessment {
    score: number;
    level: RiskLevel;
    factors: string[]; // e.g. ["VELOCITY_HIGH", "NEW_IP"]
}

export enum Permission {
    // Basic User
    BROWSE_LISTINGS = 'BROWSE_LISTINGS',
    CREATE_TRADE = 'CREATE_TRADE',

    // Moderator
    FLAG_CONTENT = 'FLAG_CONTENT',
    APPROVE_BUSINESS = 'APPROVE_BUSINESS',
    RESOLVE_DISPUTE = 'RESOLVE_DISPUTE',
    RESOLVE_DISPUTE_LITE = 'RESOLVE_DISPUTE_LITE',
    APPROVE_AMBASSADOR = 'APPROVE_AMBASSADOR',

    // Admin
    SYSTEM_FREEZE = 'SYSTEM_FREEZE',
    GRANT_VP = 'GRANT_VP',
    RESOLVE_DISPUTE_FULL = 'RESOLVE_DISPUTE_FULL',
    MANAGE_ADMINS = 'MANAGE_ADMINS',
    VERIFY_INSTITUTION = 'VERIFY_INSTITUTION',
    MANAGE_KEYS = 'MANAGE_KEYS',
    EMERGENCY_UNLOCK = 'EMERGENCY_UNLOCK',
    VERIFY_LEDGER = 'VERIFY_LEDGER',
    MONITOR_HEARTBEAT = 'MONITOR_HEARTBEAT',
    EXPORT_AUDIT = 'EXPORT_AUDIT',
    VIEW_AUDITS = 'VIEW_AUDITS', // Dashboard access
    ACCESS_INTEL = 'ACCESS_INTEL',       // Strategic dashboard access
    MANAGE_FINANCE = 'MANAGE_FINANCE',     // VP credits and grant adjustments
    BAN_USER = 'BAN_USER',                 // Suspend user accounts
    READ_ONLY_FALLBACK = 'READ_ONLY_FALLBACK' // Emergency mode restricted access
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
    USER: [Permission.BROWSE_LISTINGS, Permission.CREATE_TRADE],
    MODERATOR: [
        Permission.BROWSE_LISTINGS,
        Permission.CREATE_TRADE,
        Permission.FLAG_CONTENT,
        Permission.APPROVE_BUSINESS,
        Permission.RESOLVE_DISPUTE_LITE,
        Permission.BAN_USER
    ],
    ADMIN: Object.values(Permission),
    CTO: [
        Permission.BROWSE_LISTINGS,
        Permission.SYSTEM_FREEZE,
        Permission.MANAGE_KEYS,
        Permission.MANAGE_ADMINS,
        Permission.VERIFY_LEDGER
    ],
    COMPLIANCE: [
        Permission.BROWSE_LISTINGS,
        Permission.APPROVE_BUSINESS,
        Permission.VERIFY_INSTITUTION,
        Permission.APPROVE_AMBASSADOR
    ],
    LEGAL: [
        Permission.BROWSE_LISTINGS,
        Permission.RESOLVE_DISPUTE_FULL,
        Permission.EXPORT_AUDIT
    ],
    BOARD: [
        Permission.BROWSE_LISTINGS,
        Permission.MONITOR_HEARTBEAT,
        Permission.EMERGENCY_UNLOCK,
        Permission.EXPORT_AUDIT,
        Permission.VERIFY_LEDGER,
        Permission.ACCESS_INTEL
    ]
};
