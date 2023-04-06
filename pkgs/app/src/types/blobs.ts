import type {
  ApiBlobComponent,
  ApiBlobDocument,
  ApiBlobProject,
  ApiComponent,
  ApiDocument,
  ApiProject,
  BlockLevelZero,
} from 'api/src/types/api';
import type { DBComponent } from 'api/src/types/db';
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

export type ComponentBlobWithDiff = {
  blob: ApiBlobComponent;
  diffs: Array<ComputedForDiff<keyof DBComponent>>;
};

export type ProjectBlobWithDiff = {
  blob: ApiBlobProject;
  diffs: Array<ComputedForDiff<keyof ApiProject>>;
};

export type DocumentBlobWithDiff = {
  blob: ApiBlobDocument;
  diffs: Array<ComputedForDiff<keyof ApiDocument>>;
};

export type BlobAndDiffs =
  | ComponentBlobWithDiff
  | DocumentBlobWithDiff
  | ProjectBlobWithDiff;
