import type { Revisions, Prisma } from '@prisma/client';

import type { ReviewWithUser } from '../reviews/types.js';

export async function checkReviews(
  rev: Revisions,
  tx: Prisma.TransactionClient
): Promise<{ list: ReviewWithUser[]; check: boolean }> {
  const list = await tx.reviews.findMany({
    where: {
      orgId: rev.orgId,
      projectId: rev.projectId,
      revisionId: rev.id,
    },
    include: { User: true },
  });

  return { list, check: list.length > 0 };
}
