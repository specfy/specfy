-- CreateEnum
CREATE TYPE "SourcesType" AS ENUM(
    'github'
);

-- CreateTable
CREATE TABLE "Sources"(
    "id" varchar(15) NOT NULL,
    "orgId" varchar(36) NOT NULL,
    "projectId" varchar(15) NOT NULL,
    "type" "SourcesType" NOT NULL,
    "name" varchar(50) NOT NULL,
    "identifier" varchar(500) NOT NULL,
    "settings" json NOT NULL,
    "enable" boolean NOT NULL DEFAULT TRUE,
    "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) NOT NULL,
    CONSTRAINT "Sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceEntries"(
    "id" varchar(15) NOT NULL,
    "componentId" varchar(15) NOT NULL,
    "dataSourceId" varchar(15) NOT NULL,
    "name" varchar(100) NOT NULL,
    "path" json NOT NULL DEFAULT '[]',
    CONSTRAINT "SourceEntries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idx_sources_project" ON "Sources"("projectId", "type", "identifier");

-- AddForeignKey
ALTER TABLE "Sources"
    ADD CONSTRAINT "Sources_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Orgs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Sources"
    ADD CONSTRAINT "Sources_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SourceEntries"
    ADD CONSTRAINT "SourceEntries_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "Sources"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SourceEntries"
    ADD CONSTRAINT "SourceEntries_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Components"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Backfill data
--
INSERT INTO "Sources"(
    id,
    "orgId",
    "projectId",
    type,
    name,
    identifier,
    settings,
    ENABLE,
    "createdAt",
    "updatedAt")
SELECT
    id,
    "orgId",
    id AS projectId,
    'github',
    'GitHub',
    "githubRepository",
    config,
    TRUE,
    NOW(),
    NOW()
FROM
    "Projects"
WHERE
    "githubRepository" IS NOT NULL;

