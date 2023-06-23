-- AlterEnum
ALTER TYPE "JobsStatus"
  ADD VALUE 'timeout';

-- AlterTable
ALTER TABLE "Jobs"
  ADD COLUMN "reason" VARCHAR(250);

