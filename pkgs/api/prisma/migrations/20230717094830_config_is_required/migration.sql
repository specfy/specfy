/*
  Warnings:

  - Made the column `config` on table `Projects` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Projects" ALTER COLUMN "config" SET NOT NULL;
