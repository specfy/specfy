import type { DBReview } from '../db/reviews';

import type { ApiUser } from './users';

export type ApiReview = Pick<DBReview, 'commentId' | 'id'> & { user: ApiUser };
