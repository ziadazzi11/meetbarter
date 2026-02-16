// API Configuration for TrustTrade Platform

// Mock API endpoints (replace with real endpoints in production)
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
  },
  users: {
    profile: '/api/users/profile',
    update: '/api/users/update',
    verify: '/api/users/verify',
    trustScore: '/api/users/trust-score',
  },
  listings: {
    all: '/api/listings',
    create: '/api/listings/create',
    update: '/api/listings/update',
    delete: '/api/listings/delete',
    search: '/api/listings/search',
    byId: (id: string) => `/api/listings/${id}`,
  },
  trades: {
    all: '/api/trades',
    active: '/api/trades/active',
    pending: '/api/trades/pending',
    completed: '/api/trades/completed',
    create: '/api/trades/create',
    update: '/api/trades/update',
    byId: (id: string) => `/api/trades/${id}`,
  },
  messages: {
    all: '/api/messages',
    send: '/api/messages/send',
    thread: (id: string) => `/api/messages/thread/${id}`,
  },
  community: {
    posts: '/api/community/posts',
    create: '/api/community/create',
    comment: '/api/community/comment',
  },
  events: {
    all: '/api/events',
    byId: (id: string) => `/api/events/${id}`,
    register: '/api/events/register',
  },
  admin: {
    stats: '/api/admin/stats',
    users: '/api/admin/users',
    reports: '/api/admin/reports',
    moderation: '/api/admin/moderation',
  },
};

// Value Point (VP) Configuration
export const VP_CONFIG = {
  minValue: 10,
  maxValue: 10000,
  defaultValue: 100,
  conversionRate: 1, // 1 VP = $1 USD equivalent (for reference)
};

// Trust Score Configuration
export const TRUST_SCORE_CONFIG = {
  min: 0,
  max: 100,
  default: 50,
  verified: {
    email: 5,
    phone: 10,
    identity: 15,
    business: 20,
  },
  trade: {
    completed: 2,
    highValue: 5,
    positive_review: 3,
  },
  penalties: {
    report: -10,
    failed_trade: -5,
    late_delivery: -2,
  },
};

// Categories
export const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Services',
  'Food & Beverages',
  'Clothing & Accessories',
  'Tools & Equipment',
  'Books & Media',
  'Sports & Outdoors',
  'Art & Crafts',
  'Home & Garden',
  'Automotive',
  'Health & Beauty',
  'Toys & Games',
  'Office Supplies',
  'Other',
];

// Trade Status
export const TRADE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
} as const;

// Verification Tiers
export const VERIFICATION_TIERS = {
  BASIC: {
    name: 'Basic',
    requirements: ['Email verified'],
    benefits: ['Access to marketplace', 'Create listings'],
  },
  VERIFIED: {
    name: 'Verified',
    requirements: ['Email verified', 'Phone verified'],
    benefits: ['All Basic benefits', 'Higher trust score', 'Priority in search'],
  },
  TRUSTED: {
    name: 'Trusted',
    requirements: ['Email verified', 'Phone verified', 'Identity verified', '10+ successful trades'],
    benefits: ['All Verified benefits', 'Access to premium features', 'Verified badge'],
  },
  BUSINESS: {
    name: 'Business',
    requirements: ['Business verification', 'All Trusted requirements'],
    benefits: ['All Trusted benefits', 'Business storefront', 'Analytics dashboard'],
  },
};

export default {
  API_ENDPOINTS,
  VP_CONFIG,
  TRUST_SCORE_CONFIG,
  CATEGORIES,
  TRADE_STATUS,
  VERIFICATION_TIERS,
};
