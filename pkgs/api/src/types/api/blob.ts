import type { DBBlob } from '../db/blobs';

export type ApiBlob = DBBlob;
export type ApiBlobWithPrevious = ApiBlob & {
  previous: DBBlob['blob'] | null;
};

// GET /
export type ResListRevisionBlobs = {
  data: ApiBlobWithPrevious[];
};
