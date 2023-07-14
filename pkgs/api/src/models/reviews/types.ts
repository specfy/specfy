import type { Prisma } from '@prisma/client';

export type DBReview = {
  id: string;

  orgId: string;
  projectId: string;
  revisionId: string;
  userId: string;
  commentId: string | null;

  createdAt: string;
};

export type ReviewWithUser = Prisma.ReviewsGetPayload<{
  include: { User: true };
}>;
