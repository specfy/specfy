import type { ApiReview } from '../reviews';
import { toApiUser } from '../users/formatter.js';

import type { ReviewWithUser } from './types.js';

export function toApiReview(review: ReviewWithUser): ApiReview {
  return {
    id: review.id,
    commentId: review.commentId,
    user: toApiUser(review.User),
  };
}
