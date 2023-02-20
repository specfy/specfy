import type { DBBlob } from '../db/blobs';

export type ApiBlob = DBBlob;
export type ApiBlobWithPrevious = ApiBlob & { previous: DBBlob['blob'] };

// GET /
export type ResListRevisionBlobs = {
  data: ApiBlobWithPrevious[];
};
