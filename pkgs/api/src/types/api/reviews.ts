import type { DBReview } from '../db/reviews.js';

import type { ApiUser } from './users.js';

export type ApiReview = Pick<DBReview, 'commentId' | 'id'> & { user: ApiUser };
