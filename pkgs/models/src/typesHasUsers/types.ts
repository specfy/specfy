import type { Prisma } from '@specfy/db';

export interface DBTypeHasUser {
  documentId: string | null;
  revisionId: string | null;
  policyId: string | null;

  userId: string;
  role: 'author' | 'reviewer';

  createdAt: string;
}

export type TypeHasUsersWithUser = Prisma.TypeHasUsersGetPayload<{
  include: { User: true };
}>;
