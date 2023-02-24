import type { RevisionReview } from '../../models';
import type { ApiReview } from '../../types/api';

import { toApiUser } from './user';

export function toApiReview(review: RevisionReview): ApiReview {
  return {
    id: review.id,
    commentId: review.commentId,
    user: toApiUser(review.user),
  };
}
