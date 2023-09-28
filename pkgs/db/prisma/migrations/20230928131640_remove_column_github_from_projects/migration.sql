/*
 Warnings:

 - You are about to drop the column `config` on the `Projects` table. All the data in the column will be lost.
 - You are about to drop the column `githubRepository` on the `Projects` table. All the data in the column will be lost.
 */
-- AlterTable
ALTER TABLE "Projects"
  DROP COLUMN "config",
  DROP COLUMN "githubRepository";

-- Backport old blobs to avoid any conflict
UPDATE
  "Blobs"
SET
  CURRENT = sub.next
FROM (
  SELECT
    id,
    CURRENT::jsonb - 'githubRepository' - 'config' AS next
  FROM
    "Blobs"
  WHERE
    type = 'project') AS sub
WHERE
  "Blobs".id = sub.id;

