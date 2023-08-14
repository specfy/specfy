import type { ApiUser } from '../users/types.api.js';
import type { DBReview } from './types.js';
export type ApiReview = Pick<DBReview, 'commentId' | 'id'> & {
    user: ApiUser;
};
