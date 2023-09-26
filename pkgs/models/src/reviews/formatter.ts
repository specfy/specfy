import { toApiUser } from '../users/formatter.js';

import type { ReviewWithUser } from './types.js';
import type { ApiReview } from '../reviews';

export function toApiReview(review: ReviewWithUser): ApiReview {
  return {
    id: review.id,
    commentId: review.commentId,
    user: toApiUser(review.User),
  };
}
