-- AlterEnum
ALTER TYPE "JobsStatus"
  ADD VALUE 'timeout';

-- AlterTable
ALTER TABLE "Jobs"
  ADD COLUMN "reason" VARCHAR(250);

-- Default user for Github App
INSERT INTO "public"."Users"(
  "id",
  "name",
  "email",
  "emailVerifiedAt",
  "createdAt",
  "updatedAt")
VALUES (
  'githubapp',
  'Github App',
  'support+githubapp@specfy.io',
  NOW(),
  NOW(),
  NOW());
