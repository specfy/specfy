import type {
  ApiBlobComponent,
  ApiBlobDocument,
  ApiBlobProject,
} from '@specfy/api/src/types/api';

export const flagRevisionApprovalEnabled: boolean = false;
export const flagRevisionDescRequired: boolean = false;

const IGNORED_KEYS = [
  'id',
  'slug',
  'createdAt',
  'updatedAt',
  'blobId',
  'orgId',
] as const;

export const IGNORED_PROJECT_KEYS_CONST = [
  ...IGNORED_KEYS,
  'name',
  'githubRepository',
] as const;
export const IGNORED_PROJECT_KEYS: ReadonlyArray<
  keyof NonNullable<ApiBlobProject['current']>
> = IGNORED_PROJECT_KEYS_CONST;

export const IGNORED_COMPONENT_KEYS_CONST = [
  ...IGNORED_KEYS,
  'orgId',
  'projectId',
  'type',
  'typeId',
  'source',
  'sourceName',
  'sourcePath',
] as const;
export const IGNORED_COMPONENT_KEYS: ReadonlyArray<
  keyof NonNullable<ApiBlobComponent['current']>
> = IGNORED_COMPONENT_KEYS_CONST;

export const IGNORED_DOCUMENT_KEYS_CONST = [
  ...IGNORED_KEYS,
  'locked',
  'name',
  'type',
  'typeId',
  'source',
  'sourcePath',
] as const;
export const IGNORED_DOCUMENT_KEYS: ReadonlyArray<
  keyof NonNullable<ApiBlobDocument['current']>
> = IGNORED_DOCUMENT_KEYS_CONST;
