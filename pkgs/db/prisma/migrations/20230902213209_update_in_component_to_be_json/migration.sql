/*
  Warnings:

  - Added the required column `inComponent` to the `Components` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Components" DROP COLUMN "inComponent",
ADD COLUMN     "inComponent" JSON NOT NULL;
