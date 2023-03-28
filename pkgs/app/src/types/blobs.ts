import type {
  ApiBlobPrevious,
  ApiComponent,
  ApiDocument,
  ApiProject,
  BlockLevelZero,
} from 'api/src/types/api';
import type {
  DBComponent,
  DBBlobComponent,
  DBBlobDocument,
  DBBlobProject,
  DBDocument,
  DBProject,
} from 'api/src/types/db';
import type { Change } from 'diff';

export type Allowed = ApiComponent | ApiDocument | ApiProject;

export interface DiffObjectsArray<T> {
  added: T[];
  deleted: T[];
  unchanged: T[];
  modified: T[];
  changes: number;
}

export interface ComputedForDiff<T = unknown> {
  key: T;
  diff: BlockLevelZero | Change[] | DiffObjectsArray<any>;
}

export type ComponentBlobWithDiff = ApiBlobPrevious<DBComponent> &
  DBBlobComponent & { diffs: Array<ComputedForDiff<keyof DBComponent>> };

export type ProjectBlobWithDiff = ApiBlobPrevious<DBProject> &
  DBBlobProject & { diffs: Array<ComputedForDiff<keyof ApiProject>> };

export type DocumentBlobWithDiff = ApiBlobPrevious<DBDocument> &
  DBBlobDocument & { diffs: Array<ComputedForDiff<keyof ApiDocument>> };

export type BlobWithDiff =
  | ComponentBlobWithDiff
  | DocumentBlobWithDiff
  | ProjectBlobWithDiff;
