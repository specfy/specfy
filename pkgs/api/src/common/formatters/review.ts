import type { ApiReview } from '../../types/api/index.js';
import type { ReviewWithUser } from '../../types/db/index.js';

import { toApiUser } from './user.js';

export function toApiReview(review: ReviewWithUser): ApiReview {
  return {
    id: review.id,
    commentId: review.commentId,
    user: toApiUser(review.User),
  };
}
