import type { Writeable } from '@specfy/core';
import type {
  ApiBlobComponent,
  ApiBlobDocument,
  ApiBlobProject,
  ApiComponent,
  ApiDocument,
  ApiProject,
  BlockLevelZero,
} from '@specfy/models';
import type {
  IGNORED_COMPONENT_KEYS_CONST,
  IGNORED_DOCUMENT_KEYS_CONST,
  IGNORED_PROJECT_KEYS_CONST,
} from '@specfy/models/src/revisions/constants';
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
  diff: BlockLevelZero | Change[] | DiffObjectsArray<unknown> | 'modified';
}

export type ComponentDiffKeys = keyof Omit<
  ApiBlobComponent['current'],
  Writeable<typeof IGNORED_COMPONENT_KEYS_CONST>[number]
>;
export type ComponentBlobWithDiff = {
  blob: ApiBlobComponent;
  diffs: Array<ComputedForDiff<ComponentDiffKeys>>;
};

export type ProjectDiffKeys = keyof Omit<
  ApiBlobProject['current'],
  Writeable<typeof IGNORED_PROJECT_KEYS_CONST>[number]
>;
export type ProjectBlobWithDiff = {
  blob: ApiBlobProject;
  diffs: Array<ComputedForDiff<ProjectDiffKeys>>;
};

export type DocumentDiffKeys = keyof Omit<
  ApiBlobDocument['current'],
  Writeable<typeof IGNORED_DOCUMENT_KEYS_CONST>[number]
>;
export type DocumentBlobWithDiff = {
  blob: ApiBlobDocument;
  diffs: Array<ComputedForDiff<DocumentDiffKeys>>;
};

export type BlobAndDiffs =
  | ComponentBlobWithDiff
  | DocumentBlobWithDiff
  | ProjectBlobWithDiff;
