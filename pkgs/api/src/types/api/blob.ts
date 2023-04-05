import type { DBBlob } from '../db/blobs';

import type { ResErrors } from './api';

export type ApiBlob = DBBlob;
export type ApiBlobPrevious<T = DBBlob['blob']> = {
  previous: T | null;
};
export type ApiBlobWithPrevious = ApiBlob & ApiBlobPrevious;

// GET /
export interface ResListRevisionBlobsSuccess {
  data: ApiBlobWithPrevious[];
}
export type ResListRevisionBlobs = ResErrors | ResListRevisionBlobsSuccess;
