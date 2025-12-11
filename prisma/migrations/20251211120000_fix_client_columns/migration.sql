-- AlterTable
ALTER TABLE "Client"
ADD COLUMN "clientNumber" TEXT,
ADD COLUMN "openingBalance" DECIMAL(12,2) NOT NULL DEFAULT 0.00;

-- CreateIndex
CREATE UNIQUE INDEX "Client_clientNumber_key" ON "Client"("clientNumber");
