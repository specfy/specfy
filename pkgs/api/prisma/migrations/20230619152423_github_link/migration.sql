/*
  Warnings:

  - You are about to drop the column `githubOrg` on the `Orgs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Orgs" DROP COLUMN "githubOrg",
ADD COLUMN     "githubInstallationId" INTEGER;

-- AlterTable
ALTER TABLE "Projects" ADD COLUMN     "githubRepositoryId" INTEGER;
