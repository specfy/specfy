-- AlterTable
ALTER TABLE "Jobs" ADD COLUMN     "logsId" VARCHAR(15);

-- CreateTable
CREATE TABLE "Logs" (
    "id" VARCHAR(15) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Jobs" ADD CONSTRAINT "Jobs_logsId_fkey" FOREIGN KEY ("logsId") REFERENCES "Logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
