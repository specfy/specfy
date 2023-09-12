import type {
  ApiBlobComponent,
  ApiBlobDocument,
  ApiBlobProject,
} from '../blobs';

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
const IGNORED_KEYS_MERGE = [
  'id',
  'createdAt',
  'updatedAt',
  'blobId',
  'orgId',
] as const;

export const IGNORED_PROJECT_KEYS_CONST = [
  ...IGNORED_KEYS,
  'name',
  'githubRepository',
  'config',
] as const;
export const IGNORED_PROJECT_KEYS: ReadonlyArray<
  keyof NonNullable<ApiBlobProject['current']>
> = IGNORED_PROJECT_KEYS_CONST;

export const IGNORED_COMPONENT_KEYS_CONST = [
  ...IGNORED_KEYS,
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
export const IGNORED_COMPONENT_KEYS_MERGE = [
  ...IGNORED_KEYS_MERGE,
  'projectId',
];

export const IGNORED_DOCUMENT_KEYS_CONST = [
  ...IGNORED_KEYS,
  'locked',
  'type',
  'typeId',
  'source',
  'sourcePath',
  'hash',
] as const;
export const IGNORED_DOCUMENT_KEYS: ReadonlyArray<
  keyof NonNullable<ApiBlobDocument['current']>
> = IGNORED_DOCUMENT_KEYS_CONST;
export const IGNORED_DOCUMENT_KEYS_MERGE = [...IGNORED_KEYS_MERGE, 'projectId'];
