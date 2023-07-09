-- DropForeignKey
ALTER TABLE "Orgs" DROP CONSTRAINT "Orgs_flowId_fkey";

-- AddForeignKey
ALTER TABLE "Orgs" ADD CONSTRAINT "Orgs_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flows"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
