import type { DBComponent, DBDocument, DBProject } from '../db';
import type {
  DBBlob,
  DBBlobComponent,
  DBBlobDocument,
  DBBlobProject,
} from '../db/blobs';

import type { ResErrors } from './api';

export type ApiBlob = DBBlob;
export type ApiBlobPrevious<T = DBBlob['blob']> = {
  previous: T | null;
};
export type ApiBlobWithPrevious =
  | (ApiBlobPrevious<DBComponent> & DBBlobComponent)
  | (ApiBlobPrevious<DBDocument> & DBBlobDocument)
  | (ApiBlobPrevious<DBProject> & DBBlobProject);

// GET /
export interface ResListRevisionBlobsSuccess {
  data: ApiBlobWithPrevious[];
}
export type ResListRevisionBlobs = ResErrors | ResListRevisionBlobsSuccess;
