/*
  Warnings:

  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `acronym` to the `Orgs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `Orgs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Orgs" ADD COLUMN     "acronym" VARCHAR(3) NOT NULL,
ADD COLUMN     "avatarUrl" VARCHAR(1000),
ADD COLUMN     "color" VARCHAR(7) NOT NULL,
ADD COLUMN     "githubOrg" VARCHAR(100);

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "avatarUrl" VARCHAR(1000),
ADD COLUMN     "githubLogin" VARCHAR(100);

-- DropTable
DROP TABLE "VerificationToken";

-- CreateTable
CREATE TABLE "Invitations" (
    "id" VARCHAR(15) NOT NULL,
    "token" VARCHAR(100) NOT NULL,
    "userId" VARCHAR(15) NOT NULL,
    "orgId" VARCHAR(36) NOT NULL,
    "email" VARCHAR(250) NOT NULL,
    "role" VARCHAR(25) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_invitations_orgid_expiresat" ON "Invitations"("orgId", "expiresAt");

-- AddForeignKey
ALTER TABLE "Invitations" ADD CONSTRAINT "Invitations_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Orgs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Invitations" ADD CONSTRAINT "Invitations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
