/*
  Warnings:

  - You are about to drop the column `targetComponentId` on the `Activities` table. All the data in the column will be lost.
  - You are about to drop the column `targetDocumentId` on the `Activities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Activities" DROP COLUMN "targetComponentId",
DROP COLUMN "targetDocumentId",
ADD COLUMN     "targetBlobId" VARCHAR(15);

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_targetBlobId_fkey" FOREIGN KEY ("targetBlobId") REFERENCES "Blobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
