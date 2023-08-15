-- DropIndex
DROP INDEX "Projects_slug_key";

-- AlterTable
ALTER TABLE "Documents" ADD COLUMN     "parentId" VARCHAR(15),
ADD COLUMN     "source" VARCHAR(15),
ADD COLUMN     "sourcePath" VARCHAR(255),
ALTER COLUMN "typeId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Keys" (
    "id" VARCHAR(32) NOT NULL,
    "userId" VARCHAR(15) NOT NULL,
    "orgId" VARCHAR(36) NOT NULL,
    "projectId" VARCHAR(15),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Keys_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Keys" ADD CONSTRAINT "Keys_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Orgs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Keys" ADD CONSTRAINT "Keys_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Keys" ADD CONSTRAINT "Keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Documents"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
