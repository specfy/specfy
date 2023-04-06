import type { DBComponent, DBDocument, DBProject } from '../db';
import type {
  DBBlob,
  DBBlobComponent,
  DBBlobDocument,
  DBBlobProject,
} from '../db/blobs';

import type { ResErrors } from './api';

export type ApiBlob = DBBlob;
export type ApiBlobPrevious<T = DBBlob['current']> = {
  previous: T | null;
};

export type ApiBlobComponent = ApiBlobPrevious<DBComponent> & DBBlobComponent;
export type ApiBlobDocument = ApiBlobPrevious<DBDocument> & DBBlobDocument;
export type ApiBlobProject = ApiBlobPrevious<DBProject> & DBBlobProject;
export type ApiBlobWithPrevious =
  | ApiBlobComponent
  | ApiBlobDocument
  | ApiBlobProject;

// GET /
export interface ResListRevisionBlobsSuccess {
  data: ApiBlobWithPrevious[];
}
export type ResListRevisionBlobs = ResErrors | ResListRevisionBlobsSuccess;
