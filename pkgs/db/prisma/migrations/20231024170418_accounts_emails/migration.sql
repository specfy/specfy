-- AlterTable
ALTER TABLE "Accounts" ADD COLUMN     "emails" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "Accounts_emails_idx" ON "Accounts" USING GIN ("emails");
