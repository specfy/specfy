import { Transaction } from 'sequelize';

import type { Revision } from '../../models';
import { RevisionReview } from '../../models';

export async function checkReviews(
  rev: Revision,
  transaction: Transaction
): Promise<{ list: RevisionReview[]; check: boolean }> {
  const list = await RevisionReview.scope('withUser').findAll({
    where: {
      orgId: rev.orgId,
      projectId: rev.projectId,
      revisionId: rev.id,
    },
    lock: Transaction.LOCK.UPDATE,
    transaction,
  });

  return { list, check: list.length > 0 };
}
