import type { DBComponent, DBDocument, DBProject } from '../db/index.js';
import type {
  DBBlob,
  DBBlobComponent,
  DBBlobDocument,
  DBBlobProject,
} from '../db/blobs';

import type { QuerystringOrgProject, Res } from './api.js';
import type { ParamsRevision } from './revisions.js';

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
export type ListRevisionBlobs = Res<{
  Querystring: QuerystringOrgProject;
  Params: ParamsRevision;
  Success: {
    data: ApiBlobWithPrevious[];
  };
}>;
