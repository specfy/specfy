import type { DBReview } from './types.js';
import type { ApiUser } from '../users/types.api.js';

export type ApiReview = Pick<DBReview, 'commentId' | 'id'> & { user: ApiUser };
