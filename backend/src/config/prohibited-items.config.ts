/**
 * Prohibited Items Configuration
 * 
 * This configuration protects the platform from legal liability by automatically
 * flagging listings that contain prohibited items or keywords.
 * 
 * CRITICAL: Update this list regularly based on:
 * - Local laws in operating countries
 * - New drug/weapon slang terms
 * - User reports of circumvention attempts
 */

export const PROHIBITED_CATEGORIES = {
    DRUGS: 'drugs',
    WEAPONS: 'weapons',
    STOLEN: 'stolen',
    COUNTERFEIT: 'counterfeit',
    ADULT: 'adult',
    PRESCRIPTION: 'prescription',
    LIVE_ANIMALS: 'live_animals',
    TOBACCO: 'tobacco',
    ALCOHOL: 'alcohol',
} as const;

/**
 * Region-specific prohibited items
 * Each country/region enforces its own local laws
 */
export const REGION_PROHIBITED_ITEMS = {
    // Lebanon - strict on all drugs, weapons
    'LB': {
        [PROHIBITED_CATEGORIES.DRUGS]: [
            'weed', 'marijuana', 'cannabis', 'hash', 'hashish',
            'cocaine', 'heroin', 'meth', 'ecstasy', 'mdma', 'lsd',
            'zatla', 'zatli', 'حشيش', 'زطلة', 'مخدرات',
        ],
        [PROHIBITED_CATEGORIES.WEAPONS]: [
            'gun', 'pistol', 'rifle', 'firearm', 'سلاح', 'مسدس',
        ],
        [PROHIBITED_CATEGORIES.ALCOHOL]: ['alcohol', 'beer', 'wine', 'liquor'],
    },

    // USA - legal cannabis in some states, check state-level
    'US': {
        [PROHIBITED_CATEGORIES.DRUGS]: [
            // Hard drugs only (cannabis excluded for states where legal)
            'cocaine', 'coke', 'crack', 'heroin', 'meth', 'fentanyl',
            'ecstasy', 'mdma', 'lsd', 'acid',
        ],
        [PROHIBITED_CATEGORIES.WEAPONS]: [
            // Federal restrictions only (firearms legal in some states)
            'automatic weapon', 'grenade', 'explosive', 'full auto',
        ],
        [PROHIBITED_CATEGORIES.TOBACCO]: [], // Legal
        [PROHIBITED_CATEGORIES.ALCOHOL]: [], // Legal
    },

    // UAE - very strict on drugs, alcohol, weapons
    'AE': {
        [PROHIBITED_CATEGORIES.DRUGS]: [
            'weed', 'marijuana', 'cannabis', 'hash', 'cbd',
            'cocaine', 'heroin', 'meth', 'ecstasy', 'lsd',
            'حشيش', 'مخدرات',
        ],
        [PROHIBITED_CATEGORIES.WEAPONS]: ['gun', 'pistol', 'knife', 'blade', 'سلاح'],
        [PROHIBITED_CATEGORIES.ALCOHOL]: ['alcohol', 'beer', 'wine', 'liquor'],
    },

    // France - moderate restrictions
    'FR': {
        [PROHIBITED_CATEGORIES.DRUGS]: [
            'cannabis', 'cocaine', 'heroin', 'meth', 'ecstasy', 'lsd',
        ],
        [PROHIBITED_CATEGORIES.WEAPONS]: ['gun', 'pistol', 'firearm'],
    },

    // Canada - cannabis legal, strict on other drugs
    'CA': {
        [PROHIBITED_CATEGORIES.DRUGS]: [
            'cocaine', 'heroin', 'meth', 'fentanyl', 'ecstasy', 'lsd',
            // Cannabis excluded (legal)
        ],
        [PROHIBITED_CATEGORIES.WEAPONS]: ['handgun', 'automatic weapon'],
    },
};

/**
 * Global prohibited items (illegal everywhere)
 */
export const GLOBAL_PROHIBITED_KEYWORDS = {
    // Stolen Items (English)
    [PROHIBITED_CATEGORIES.STOLEN]: [
        'stolen', 'no receipt', 'hot', 'fell off truck',
        'no questions asked', 'icloud locked', 'blacklisted',
    ],

    // Counterfeit (English)
    [PROHIBITED_CATEGORIES.COUNTERFEIT]: [
        'replica', 'fake', 'knockoff', 'counterfeit', 'copy',
        'aaa quality', 'mirror quality', 'unauthorized',
    ],

    // Prescription Medication (requires verification)
    [PROHIBITED_CATEGORIES.PRESCRIPTION]: [
        'prescription', 'rx', 'no prescription needed',
        'viagra', 'cialis', 'antibiotics', 'insulin',
        'ritalin', 'concerta', 'vyvanse', 'xanax', 'adderall',
    ],

    // Adult Content (English)
    [PROHIBITED_CATEGORIES.ADULT]: [
        'escort', 'massage with benefits', 'adult services',
        'sex', 'porn', 'xxx', 'nsfw',
    ],

    // Live Animals (restricted globally, requires verification)
    [PROHIBITED_CATEGORIES.LIVE_ANIMALS]: [
        'puppy', 'kitten', 'dog for sale', 'cat for sale',
        'exotic pet', 'monkey', 'snake', 'reptile',
    ],
};

/**
 * Default region if country not configured
 */
export const DEFAULT_PROHIBITED_ITEMS = REGION_PROHIBITED_ITEMS['LB'];

/**
 * Severity levels for moderation
 */
export const MODERATION_SEVERITY = {
    AUTO_REJECT: 'auto_reject', // Immediately reject, don't even queue
    HIGH_RISK: 'high_risk',     // Queue for review, notify admin immediately
    MEDIUM_RISK: 'medium_risk', // Queue for review, normal priority
    LOW_RISK: 'low_risk',       // Allow but track for patterns
} as const;

/**
 * Category severity mapping
 */
export const CATEGORY_SEVERITY_MAP = {
    [PROHIBITED_CATEGORIES.DRUGS]: MODERATION_SEVERITY.AUTO_REJECT,
    [PROHIBITED_CATEGORIES.WEAPONS]: MODERATION_SEVERITY.AUTO_REJECT,
    [PROHIBITED_CATEGORIES.STOLEN]: MODERATION_SEVERITY.HIGH_RISK,
    [PROHIBITED_CATEGORIES.COUNTERFEIT]: MODERATION_SEVERITY.MEDIUM_RISK,
    [PROHIBITED_CATEGORIES.ADULT]: MODERATION_SEVERITY.HIGH_RISK,
    [PROHIBITED_CATEGORIES.PRESCRIPTION]: MODERATION_SEVERITY.HIGH_RISK,
    [PROHIBITED_CATEGORIES.LIVE_ANIMALS]: MODERATION_SEVERITY.LOW_RISK,
} as const;

/**
 * User violation thresholds
 */
export const VIOLATION_THRESHOLDS = {
    WARNING: 1,           // First offense: warning email
    TEMPORARY_BAN: 2,     // Second offense: 7-day ban
    PERMANENT_BAN: 3,     // Third offense: permanent ban
} as const;

/**
 * Admin notification settings
 */
export const ADMIN_NOTIFICATION_CONFIG = {
    EMAIL_ON_AUTO_REJECT: true,
    EMAIL_ON_HIGH_RISK: true,
    EMAIL_ON_USER_REPORT: true,
    BATCH_NOTIFICATIONS: false, // Send immediately, don't batch
} as const;
