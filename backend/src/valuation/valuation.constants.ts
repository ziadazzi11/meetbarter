export const ORIGIN_MULTIPLIERS: Record<string, number> = {
    PERSONAL_GIFT: 1.0,
    COMMERCIAL_INVENTORY: 0.9,
    LIQUIDATION: 0.7,
    HANDMADE: 1.2,
};

export const CONDITION_TABLE: Record<string, number> = {
    NEW: 1.0,
    LIKE_NEW: 0.9,
    GOOD: 0.75,
    FAIR: 0.5,
    POOR: 0.3,
};

export const AUTHENTICITY_TABLE: Record<string, number> = {
    VERIFIED_ORIGINAL: 1.0,
    REPLICA_DECLARED: 0.4,
    UNVERIFIED: 0.8,
};
