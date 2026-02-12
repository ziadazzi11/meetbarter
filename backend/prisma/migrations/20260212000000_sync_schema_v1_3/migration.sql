-- AlterTable: Add missing columns to SystemConfig
ALTER TABLE "SystemConfig" ADD COLUMN "whishPhoneNumber" TEXT NOT NULL DEFAULT '0096171023083',
ADD COLUMN "omtPhoneNumber" TEXT,
ADD COLUMN "ambassadorTradeThreshold" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN "legalEntityId" TEXT;

-- AlterTable: Add missing columns to UserActivityMetric for streaks
ALTER TABLE "UserActivityMetric" ADD COLUMN "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "longestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastLoginDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable: Achievement
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rewardVP" INTEGER NOT NULL,
    "iconUrl" TEXT,
    "criteria" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserAchievement
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable: GeoDrop
CREATE TABLE "GeoDrop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "rewardVP" INTEGER NOT NULL,
    "qrCodeHash" TEXT NOT NULL,
    "maxClaims" INTEGER NOT NULL DEFAULT 100,
    "currentClaims" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "communityEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeoDrop_pkey" PRIMARY KEY ("id")
);

-- CreateTable: GeoDropClaim
CREATE TABLE "GeoDropClaim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "geoDropId" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeoDropClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Achievement.id_key (Prisma usually handles this via pkey but good to be safe)
-- CREATE UNIQUE INDEX "Achievement_id_key" ON "Achievement"("id");

-- CreateIndex: UserAchievement unique and index
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

-- CreateIndex: GeoDropClaim unique and index
CREATE UNIQUE INDEX "GeoDropClaim_userId_geoDropId_key" ON "GeoDropClaim"("userId", "geoDropId");
CREATE INDEX "GeoDropClaim_userId_idx" ON "GeoDropClaim"("userId");

-- CreateIndex for GeoDrop
CREATE UNIQUE INDEX "GeoDrop_qrCodeHash_key" ON "GeoDrop"("qrCodeHash");

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoDrop" ADD CONSTRAINT "GeoDrop_communityEventId_fkey" FOREIGN KEY ("communityEventId") REFERENCES "CommunityEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoDropClaim" ADD CONSTRAINT "GeoDropClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GeoDropClaim" ADD CONSTRAINT "GeoDropClaim_geoDropId_fkey" FOREIGN KEY ("geoDropId") REFERENCES "GeoDrop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
