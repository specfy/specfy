import type { DBBlob } from '../db/blobs';

export type ApiBlob = DBBlob;
export type ApiBlobPrevious<T = DBBlob['blob']> = {
  previous: T | null;
};
export type ApiBlobWithPrevious = ApiBlob & ApiBlobPrevious;

// GET /
export type ResListRevisionBlobs = {
  data: ApiBlobWithPrevious[];
};
