-- AlterTable
ALTER TABLE "Orgs" ADD COLUMN     "flowId" VARCHAR(15);

-- AddForeignKey
ALTER TABLE "Orgs" ADD CONSTRAINT "Orgs_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flows"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
