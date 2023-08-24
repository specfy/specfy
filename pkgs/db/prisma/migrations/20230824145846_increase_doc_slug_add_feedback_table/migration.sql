-- AlterTable
ALTER TABLE "Documents" ALTER COLUMN "slug" SET DATA TYPE VARCHAR(250);

-- CreateTable
CREATE TABLE "Feedbacks" (
    "id" VARCHAR(15) NOT NULL,
    "userId" VARCHAR(15) NOT NULL,
    "orgId" VARCHAR(36),
    "feedback" VARCHAR NOT NULL,
    "referer" VARCHAR(2000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedbacks_pkey" PRIMARY KEY ("id")
);
