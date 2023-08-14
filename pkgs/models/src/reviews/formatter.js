import { toApiUser } from '../users/formatter.js';
export function toApiReview(review) {
    return {
        id: review.id,
        commentId: review.commentId,
        user: toApiUser(review.User),
    };
}
