import type { DBReview } from '../db/reviews';

import type { ApiUser } from './me';

export type ApiReview = Pick<DBReview, 'commentId' | 'id'> & { user: ApiUser };
