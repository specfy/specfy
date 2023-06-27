/*
  Warnings:

  - The `reason` column on the `Jobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Components" ADD COLUMN     "source" VARCHAR(15),
ADD COLUMN     "sourceName" VARCHAR(100),
ADD COLUMN     "sourcePath" JSON;

-- AlterTable
ALTER TABLE "Jobs" DROP COLUMN "reason",
ADD COLUMN     "reason" JSON;
