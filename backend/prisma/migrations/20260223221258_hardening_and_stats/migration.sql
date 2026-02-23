-- AlterTable
ALTER TABLE "User" ADD COLUMN     "idCardStatus" "VerificationStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "idCardUrl" TEXT;
