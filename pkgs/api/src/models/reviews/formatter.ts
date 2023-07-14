import type { ApiReview } from '../../types/api/index.js';
import { toApiUser } from '../users/formatter.js';

import type { ReviewWithUser } from './types.js';

export function toApiReview(review: ReviewWithUser): ApiReview {
  return {
    id: review.id,
    commentId: review.commentId,
    user: toApiUser(review.User),
  };
}
