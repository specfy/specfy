/*
 Warnings:

 - You are about to drop the column `githubRepositoryId` on the `Projects` table. All the data in the column will be lost.
 */
-- CreateEnum
CREATE TYPE "JobsType" AS ENUM(
  'deploy'
);

-- CreateEnum
CREATE TYPE "JobsStatus" AS ENUM(
  'pending',
  'running',
  'success',
  'failed',
  'skipped',
  'cancelled'
);

-- AlterTable
ALTER TABLE "Projects"
  DROP COLUMN "githubRepositoryId",
  ADD COLUMN "githubRepository" TEXT;

-- CreateTable
CREATE TABLE "Jobs"(
  "id" varchar(15) NOT NULL,
  "orgId" varchar(36) NOT NULL,
  "projectId" varchar(15),
  "userId" varchar(15),
  "type" "JobsType" NOT NULL,
  "status" "JobsStatus" NOT NULL,
  "config" json NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" timestamp(3),
  "finishedAt" timestamp(3),
  "updatedAt" timestamp(3) NOT NULL,
  CONSTRAINT "Jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_jobs_worker" ON "Jobs"("type", "createdAt")
WHERE
  "status" = 'pending';

-- CreateIndex
CREATE INDEX "idx_jobs_display" ON "Jobs"("orgId", "projectId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_jobs_display_bystatus" ON "Jobs"("orgId", "projectId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "Activities"
  ADD CONSTRAINT "Activities_targetRevisionId_fkey" FOREIGN KEY ("targetRevisionId") REFERENCES "Revisions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Jobs"
  ADD CONSTRAINT "Jobs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Orgs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Jobs"
  ADD CONSTRAINT "Jobs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Jobs"
  ADD CONSTRAINT "Jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

