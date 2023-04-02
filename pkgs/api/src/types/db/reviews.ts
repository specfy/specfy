import type { Prisma } from '@prisma/client';

export type DBReview = {
  id: bigint;

  orgId: string;
  projectId: string;
  revisionId: string;
  userId: string;
  commentId: bigint | null;

  createdAt: string;
};

export type ReviewWithUser = Prisma.ReviewsGetPayload<{
  include: { User: true };
}>;
