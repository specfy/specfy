-- CreateTable
CREATE TABLE "Accounts" (
    "id" VARCHAR(15) NOT NULL,
    "userId" VARCHAR(15) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "provider" VARCHAR(100) NOT NULL,
    "providerAccountId" VARCHAR(100) NOT NULL,
    "refreshToken" VARCHAR(100),
    "accessToken" VARCHAR(100),
    "tokenType" VARCHAR(100),
    "token" TEXT,
    "scope" TEXT NOT NULL,
    "sessionState" TEXT,
    "expiresAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activities" (
    "id" VARCHAR(15) NOT NULL,
    "orgId" VARCHAR(36),
    "projectId" VARCHAR(15),
    "userId" VARCHAR(15) NOT NULL,
    "activityGroupId" VARCHAR(15) NOT NULL,
    "action" VARCHAR(25) NOT NULL,
    "targetUserId" VARCHAR(15),
    "targetComponentId" VARCHAR(15),
    "targetDocumentId" VARCHAR(15),
    "targetRevisionId" VARCHAR(15),
    "targetPolicyId" VARCHAR(15),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blobs" (
    "id" VARCHAR(15) NOT NULL,
    "type" VARCHAR(36) NOT NULL,
    "typeId" VARCHAR(36) NOT NULL,
    "parentId" VARCHAR(15),
    "blob" JSON,
    "created" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comments" (
    "id" VARCHAR(15) NOT NULL,
    "orgId" VARCHAR(36) NOT NULL,
    "projectId" VARCHAR(15) NOT NULL,
    "revisionId" VARCHAR(15) NOT NULL,
    "userId" VARCHAR(15) NOT NULL,
    "content" JSON NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Components" (
    "id" VARCHAR(15) NOT NULL,
    "orgId" VARCHAR(36) NOT NULL,
    "projectId" VARCHAR(15) NOT NULL,
    "blobId" VARCHAR(15),
    "techId" VARCHAR(50),
    "type" VARCHAR(25) NOT NULL,
    "typeId" VARCHAR(36),
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" JSON NOT NULL,
    "tech" JSON NOT NULL,
    "display" JSON NOT NULL,
    "inComponent" VARCHAR(15),
    "edges" JSON NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documents" (
    "id" VARCHAR(15) NOT NULL,
    "orgId" VARCHAR(36) NOT NULL,
    "projectId" VARCHAR(15) NOT NULL,
    "blobId" VARCHAR(15),
    "type" VARCHAR(25) NOT NULL,
    "typeId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "tldr" VARCHAR(500) NOT NULL,
    "content" JSON NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orgs" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(36) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Perms" (
    "id" VARCHAR(15) NOT NULL,
    "orgId" VARCHAR(36) NOT NULL,
    "projectId" VARCHAR(15),
    "userId" VARCHAR(15) NOT NULL,
    "role" VARCHAR(25) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Perms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policies" (
    "id" VARCHAR(15) NOT NULL,
    "orgId" VARCHAR(36) NOT NULL,
    "type" VARCHAR(36) NOT NULL,
    "name" VARCHAR(250),
    "tech" VARCHAR(36),
    "content" JSON NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projects" (
    "id" VARCHAR(15) NOT NULL,
    "orgId" VARCHAR(36) NOT NULL,
    "blobId" VARCHAR(15),
    "name" VARCHAR(36) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" JSON NOT NULL,
    "links" JSON NOT NULL,
    "display" JSON NOT NULL,
    "edges" JSON NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reviews" (
    "id" VARCHAR(15) NOT NULL,
    "orgId" VARCHAR(36) NOT NULL,
    "projectId" VARCHAR(15) NOT NULL,
    "revisionId" VARCHAR(15) NOT NULL,
    "userId" VARCHAR(15) NOT NULL,
    "commentId" VARCHAR(15),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revisions" (
    "id" VARCHAR(15) NOT NULL,
    "orgId" VARCHAR(36) NOT NULL,
    "projectId" VARCHAR(15) NOT NULL,
    "name" VARCHAR(75) NOT NULL,
    "description" JSON NOT NULL,
    "blobs" JSON NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(25) NOT NULL DEFAULT 'draft',
    "merged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mergedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessions" (
    "id" VARCHAR(15) NOT NULL,
    "userId" VARCHAR(15) NOT NULL,
    "sessionToken" VARCHAR(100) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeHasUsers" (
    "id" BIGSERIAL NOT NULL,
    "documentId" VARCHAR(15),
    "revisionId" VARCHAR(15),
    "policyId" VARCHAR(15),
    "userId" VARCHAR(15) NOT NULL,
    "role" VARCHAR(25) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TypeHasUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" VARCHAR(15) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(250) NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "token" VARCHAR(100) NOT NULL,
    "identifier" VARCHAR(100) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE INDEX "idx_activities_projectid_group" ON "Activities"("orgId", "projectId", "activityGroupId");

-- CreateIndex
CREATE INDEX "idx_comments_orgid_projectid_revisionid" ON "Comments"("orgId", "projectId", "revisionId");

-- CreateIndex
CREATE INDEX "idx_document_orgid_projectid" ON "Documents"("orgId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "idx_document_orgid_type_typeid" ON "Documents"("orgId", "type", "typeId");

-- CreateIndex
CREATE UNIQUE INDEX "idx_team_org_userid_projectid" ON "Perms"("orgId", "userId", "projectId");

-- CreateIndex
CREATE INDEX "idx_policies_orgid_type" ON "Policies"("orgId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Projects_slug_key" ON "Projects"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "idx_projects_orgid_slug" ON "Projects"("orgId", "slug");

-- CreateIndex
CREATE INDEX "idx_reviews_orgid_projectid_revisionid" ON "Reviews"("orgId", "projectId", "revisionId");

-- CreateIndex
CREATE UNIQUE INDEX "idx_sessions_token" ON "Sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "idx_documentid_userid" ON "TypeHasUsers"("documentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "idx_policyid_userid" ON "TypeHasUsers"("policyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "idx_revisionid_userid" ON "TypeHasUsers"("revisionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "idx_users_email" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Accounts" ADD CONSTRAINT "Accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Orgs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Blobs" ADD CONSTRAINT "Blobs_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Blobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Orgs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revisions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Components" ADD CONSTRAINT "Components_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Orgs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Components" ADD CONSTRAINT "Components_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Components" ADD CONSTRAINT "Components_blobId_fkey" FOREIGN KEY ("blobId") REFERENCES "Blobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Orgs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_blobId_fkey" FOREIGN KEY ("blobId") REFERENCES "Blobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Perms" ADD CONSTRAINT "Perms_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Orgs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Perms" ADD CONSTRAINT "Perms_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Perms" ADD CONSTRAINT "Perms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Policies" ADD CONSTRAINT "Policies_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Orgs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Orgs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_blobId_fkey" FOREIGN KEY ("blobId") REFERENCES "Blobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Orgs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revisions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Revisions" ADD CONSTRAINT "Revisions_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Orgs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Revisions" ADD CONSTRAINT "Revisions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TypeHasUsers" ADD CONSTRAINT "TypeHasUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TypeHasUsers" ADD CONSTRAINT "TypeHasUsers_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revisions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TypeHasUsers" ADD CONSTRAINT "TypeHasUsers_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TypeHasUsers" ADD CONSTRAINT "TypeHasUsers_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Documents"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
