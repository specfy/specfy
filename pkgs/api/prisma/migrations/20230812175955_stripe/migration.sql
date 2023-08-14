/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Orgs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `Orgs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Orgs" ADD COLUMN     "currentPlanId" TEXT,
ADD COLUMN     "stripeCurrentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "stripeCurrentPeriodStart" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Orgs_stripeCustomerId_key" ON "Orgs"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Orgs_stripeSubscriptionId_key" ON "Orgs"("stripeSubscriptionId");
