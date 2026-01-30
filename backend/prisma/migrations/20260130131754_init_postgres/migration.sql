-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('OFFER_MADE', 'LOCKED', 'CONFIRMED_BY_BUYER', 'CONFIRMED_BY_SELLER', 'COMPLETED', 'DISPUTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'TRADED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NONE', 'PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "BountyStatus" AS ENUM ('OPEN', 'CLAIMED', 'SUBMITTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "GovernanceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "globalTrustScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "walletBalance" INTEGER NOT NULL DEFAULT 0,
    "isSupporter" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumber" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Lebanon',
    "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE',
    "referredByUserId" TEXT,
    "ambassadorScore" INTEGER NOT NULL DEFAULT 0,
    "ambassadorStatus" TEXT NOT NULL DEFAULT 'NONE',
    "isBusiness" BOOLEAN NOT NULL DEFAULT false,
    "businessName" TEXT,
    "businessVerificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NONE',
    "businessVerificationData" TEXT,
    "communityRole" TEXT,
    "communityVerificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NONE',
    "communityEvidence" TEXT,
    "verificationLevel" INTEGER NOT NULL DEFAULT 1,
    "complianceMetadata" TEXT,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "bannedAt" TIMESTAMP(3),
    "isShadowbanned" BOOLEAN NOT NULL DEFAULT false,
    "shadowbanReason" TEXT,
    "termsAcceptedAt" TIMESTAMP(3),
    "refreshTokenHash" TEXT,
    "mfaSecret" TEXT,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastIp" TEXT,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "termsVersion" TEXT,
    "authProvider" TEXT,
    "avatarUrl" TEXT,
    "bannerUrl" TEXT,
    "themePreferences" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "heir1Name" TEXT,
    "heir1Key" TEXT,
    "heir2Name" TEXT,
    "heir2Key" TEXT,
    "heir3Name" TEXT,
    "heir3Key" TEXT,
    "heir4Name" TEXT,
    "heir4Key" TEXT,
    "heir5Name" TEXT,
    "heir5Key" TEXT,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeceased" BOOLEAN NOT NULL DEFAULT false,
    "deathDate" TEXT,
    "deathPlace" TEXT,
    "mokhtarName" TEXT,
    "mokhtarLicense" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minVP" INTEGER NOT NULL DEFAULT 0,
    "maxVP" INTEGER NOT NULL DEFAULT 1000,
    "trustThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "escrowPercentage" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "maxModerationVP" INTEGER NOT NULL DEFAULT 50,
    "maxVerificationVP" INTEGER NOT NULL DEFAULT 50,
    "maxDisputeVP" INTEGER NOT NULL DEFAULT 100,
    "maxLogisticsVP" INTEGER NOT NULL DEFAULT 100,
    "maxFraudVP" INTEGER NOT NULL DEFAULT 200,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCategoryTrust" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "UserCategoryTrust_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceVP" INTEGER NOT NULL,
    "originalPrice" INTEGER,
    "condition" TEXT,
    "originType" TEXT NOT NULL DEFAULT 'PERSONAL_GIFT',
    "authenticityStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "isRefurbished" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'Beirut',
    "country" TEXT NOT NULL DEFAULT 'Lebanon',
    "attributes" TEXT,
    "listingType" TEXT NOT NULL DEFAULT 'OFFER',
    "expiresAt" TIMESTAMP(3),
    "circleId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'APPROVED',
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "categoryId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "offerVP" INTEGER NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'OFFER_MADE',
    "coordinationEscrowVP" INTEGER NOT NULL DEFAULT 0,
    "operationalEscrowVP" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "justification" TEXT,
    "cashOffer" DOUBLE PRECISION,
    "cashCurrency" TEXT DEFAULT 'USD',
    "intentTimestamp" TIMESTAMP(3),
    "preTradeChecklist" TEXT,
    "buyerConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "sellerConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeOperationCost" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "amountVP" INTEGER NOT NULL,
    "justification" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradeOperationCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "fromUserId" TEXT,
    "toUserId" TEXT,
    "amountVP" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "alphaCode" TEXT NOT NULL DEFAULT '2abwal2ibin',
    "betaCode" TEXT NOT NULL DEFAULT 'love one another',
    "fingerprintCode" TEXT NOT NULL DEFAULT 'FINGERPRINT',
    "baseEscrowRate" INTEGER NOT NULL DEFAULT 15,
    "laborBaseline" INTEGER NOT NULL DEFAULT 6,
    "emergencyFundVP" INTEGER NOT NULL DEFAULT 0,
    "ambassadorFundVP" INTEGER NOT NULL DEFAULT 0,
    "adminFundVP" INTEGER NOT NULL DEFAULT 0,
    "marketSentimentIndex" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "isCrisisActive" BOOLEAN NOT NULL DEFAULT true,
    "lastMarketCheck" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featureFlags" TEXT,
    "heir1" TEXT NOT NULL DEFAULT 'Siham Hareb',
    "heir1Key" TEXT NOT NULL DEFAULT 'be',
    "heir2" TEXT NOT NULL DEFAULT 'Sandra Azzi Alkorem',
    "heir2Key" TEXT NOT NULL DEFAULT 'happy',
    "heir3" TEXT NOT NULL DEFAULT 'Lara Azzi',
    "heir3Key" TEXT NOT NULL DEFAULT 'i',
    "heir4" TEXT NOT NULL DEFAULT 'Joseph Chidiac',
    "heir4Key" TEXT NOT NULL DEFAULT 'love',
    "heir5" TEXT NOT NULL DEFAULT 'Alexander Chidiac',
    "heir5Key" TEXT NOT NULL DEFAULT 'you',
    "lastAdminActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deathCertificateVerified" BOOLEAN NOT NULL DEFAULT false,
    "deathDate" TEXT,
    "deathPlace" TEXT,
    "mokhtarName" TEXT,
    "mokhtarLicense" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "riskScore" INTEGER,
    "hash" TEXT,
    "previousHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tradeId" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityGrant" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "amountVP" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "adminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentModerationFlag" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "reportedByUserId" TEXT,
    "reason" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "matchedKeywords" TEXT,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentModerationFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeTimeline" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,

    CONSTRAINT "TradeTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeCircle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeCircle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CircleMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CircleMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivityMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "averageReplyHours" DOUBLE PRECISION,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserActivityMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CityPulseCache" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "topCategories" TEXT NOT NULL,
    "newListingsToday" INTEGER NOT NULL DEFAULT 0,
    "activeTraders" INTEGER NOT NULL DEFAULT 0,
    "sentimentScore" INTEGER NOT NULL DEFAULT 50,
    "isCrisisActive" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CityPulseCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bounty" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rewardVP" INTEGER NOT NULL,
    "status" "BountyStatus" NOT NULL DEFAULT 'OPEN',
    "assigneeId" TEXT,
    "submissionEvidence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bounty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Successor" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT NOT NULL,
    "unlockDate" TIMESTAMP(3) NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Successor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchLog" (
    "id" TEXT NOT NULL,
    "queryHash" TEXT NOT NULL,
    "sessionHash" TEXT,
    "intentVector" TEXT,
    "locationHash" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InteractionLog" (
    "id" TEXT NOT NULL,
    "sessionHash" TEXT,
    "type" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL DEFAULT 1,
    "intentVector" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InteractionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketSnapshot" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" TEXT NOT NULL,
    "supplyCount" INTEGER NOT NULL,
    "demandScore" DOUBLE PRECISION NOT NULL,
    "opportunityIndex" DOUBLE PRECISION NOT NULL,
    "tradeVelocity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MarketSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessLicense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "permitType" TEXT NOT NULL,
    "issuingAuthority" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastVerifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernanceRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" "GovernanceStatus" NOT NULL DEFAULT 'PENDING',
    "approverId" TEXT,
    "approvalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "executedAt" TIMESTAMP(3),

    CONSTRAINT "GovernanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isBusiness_idx" ON "User"("isBusiness");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserCategoryTrust_userId_categoryId_key" ON "UserCategoryTrust"("userId", "categoryId");

-- CreateIndex
CREATE INDEX "Listing_sellerId_idx" ON "Listing"("sellerId");

-- CreateIndex
CREATE INDEX "Listing_categoryId_idx" ON "Listing"("categoryId");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_location_idx" ON "Listing"("location");

-- CreateIndex
CREATE INDEX "Listing_listingType_idx" ON "Listing"("listingType");

-- CreateIndex
CREATE INDEX "Listing_createdAt_idx" ON "Listing"("createdAt");

-- CreateIndex
CREATE INDEX "Trade_buyerId_idx" ON "Trade"("buyerId");

-- CreateIndex
CREATE INDEX "Trade_sellerId_idx" ON "Trade"("sellerId");

-- CreateIndex
CREATE INDEX "Trade_listingId_idx" ON "Trade"("listingId");

-- CreateIndex
CREATE INDEX "Trade_status_idx" ON "Trade"("status");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "TradeTimeline_tradeId_idx" ON "TradeTimeline"("tradeId");

-- CreateIndex
CREATE INDEX "CircleMembership_circleId_idx" ON "CircleMembership"("circleId");

-- CreateIndex
CREATE UNIQUE INDEX "CircleMembership_userId_circleId_key" ON "CircleMembership"("userId", "circleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserActivityMetric_userId_key" ON "UserActivityMetric"("userId");

-- CreateIndex
CREATE INDEX "CityPulseCache_country_idx" ON "CityPulseCache"("country");

-- CreateIndex
CREATE UNIQUE INDEX "CityPulseCache_city_country_key" ON "CityPulseCache"("city", "country");

-- CreateIndex
CREATE INDEX "SearchLog_queryHash_idx" ON "SearchLog"("queryHash");

-- CreateIndex
CREATE INDEX "SearchLog_locationHash_idx" ON "SearchLog"("locationHash");

-- CreateIndex
CREATE INDEX "InteractionLog_type_idx" ON "InteractionLog"("type");

-- CreateIndex
CREATE INDEX "InteractionLog_targetId_idx" ON "InteractionLog"("targetId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketSnapshot_date_categoryId_key" ON "MarketSnapshot"("date", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessLicense_userId_key" ON "BusinessLicense"("userId");

-- CreateIndex
CREATE INDEX "BusinessLicense_userId_idx" ON "BusinessLicense"("userId");

-- CreateIndex
CREATE INDEX "BusinessLicense_status_idx" ON "BusinessLicense"("status");

-- CreateIndex
CREATE INDEX "GovernanceRequest_status_idx" ON "GovernanceRequest"("status");

-- AddForeignKey
ALTER TABLE "UserCategoryTrust" ADD CONSTRAINT "UserCategoryTrust_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCategoryTrust" ADD CONSTRAINT "UserCategoryTrust_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "TradeCircle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeOperationCost" ADD CONSTRAINT "TradeOperationCost_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityGrant" ADD CONSTRAINT "CommunityGrant_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentModerationFlag" ADD CONSTRAINT "ContentModerationFlag_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentModerationFlag" ADD CONSTRAINT "ContentModerationFlag_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeTimeline" ADD CONSTRAINT "TradeTimeline_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CircleMembership" ADD CONSTRAINT "CircleMembership_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "TradeCircle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivityMetric" ADD CONSTRAINT "UserActivityMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bounty" ADD CONSTRAINT "Bounty_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Successor" ADD CONSTRAINT "Successor_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketSnapshot" ADD CONSTRAINT "MarketSnapshot_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessLicense" ADD CONSTRAINT "BusinessLicense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceRequest" ADD CONSTRAINT "GovernanceRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceRequest" ADD CONSTRAINT "GovernanceRequest_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
