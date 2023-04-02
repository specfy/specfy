import type { ApiReview } from '../../types/api';
import type { ReviewWithUser } from '../../types/db';

import { toApiUser } from './user';

export function toApiReview(review: ReviewWithUser): ApiReview {
  return {
    id: review.id,
    commentId: review.commentId,
    user: toApiUser(review.User),
  };
}
