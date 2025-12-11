-- AlterTable
ALTER TABLE "CompanyProfile"
ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "currency" TEXT NOT NULL DEFAULT '₹',
ADD COLUMN "logoUrl" TEXT,
ADD COLUMN "termsAndConditions" TEXT DEFAULT 'Goods once sold will not be taken back.\nInterest @ 18% p.a. will be charged for delayed payment.\nSubject to Tamil Nadu Jurisdiction only.';
