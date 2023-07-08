/*
  Warnings:

  - You are about to drop the column `tech` on the `Components` table. All the data in the column will be lost.
  - You are about to drop the column `display` on the `Projects` table. All the data in the column will be lost.
  - You are about to drop the column `edges` on the `Projects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Components" DROP COLUMN "tech",
ADD COLUMN     "show" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tags" JSON NOT NULL DEFAULT '[]',
ADD COLUMN     "techs" JSON NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "Projects" DROP COLUMN "display",
DROP COLUMN "edges";

-- CreateTable
CREATE TABLE "Flows" (
    "id" VARCHAR(15) NOT NULL,
    "orgId" VARCHAR(36) NOT NULL,
    "flow" JSON NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flows_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Flows" ADD CONSTRAINT "Flows_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Orgs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
