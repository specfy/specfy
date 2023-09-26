-- AlterTable
ALTER TABLE "Revisions" ADD COLUMN     "jobId" VARCHAR(15);

-- AddForeignKey
ALTER TABLE "Revisions" ADD CONSTRAINT "Revisions_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Jobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
