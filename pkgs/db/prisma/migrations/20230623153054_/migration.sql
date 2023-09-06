-- AlterEnum
ALTER TYPE "JobsStatus"
  ADD VALUE 'timeout';

-- AlterTable
ALTER TABLE "Jobs"
  ADD COLUMN "reason" VARCHAR(250);

-- Default user for GitHub App
INSERT INTO "public"."Users"(
  "id",
  "name",
  "avatarUrl",
  "email",
  "emailVerifiedAt",
  "createdAt",
  "updatedAt")
VALUES (
  'githubapp',
  'Github App',
  '/github-mark.png',
  'support+githubapp@specfy.io',
  NOW(),
  NOW(),
  NOW());
