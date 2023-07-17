import type { QuerystringOrgProject, Res } from '../../types/api/api.js';
import type { DBComponent } from '../components/types.js';
import type { DBDocument } from '../documents/types.js';
import type { DBProject } from '../projects/types.js';
import type { ParamsRevision } from '../revisions/types.api.js';

import type {
  DBBlob,
  DBBlobComponent,
  DBBlobDocument,
  DBBlobProject,
} from './types.js';

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
