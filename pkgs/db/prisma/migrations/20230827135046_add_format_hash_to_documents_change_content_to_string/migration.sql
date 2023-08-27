/*
  Warnings:

  - Added the required column `format` to the `Documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hash` to the `Documents` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentFormat" AS ENUM ('md', 'pm');

-- AlterTable
ALTER TABLE "Documents" ADD COLUMN     "format" "DocumentFormat" NOT NULL,
ADD COLUMN     "hash" VARCHAR(64) NOT NULL,
ALTER COLUMN "content" SET DATA TYPE TEXT;
