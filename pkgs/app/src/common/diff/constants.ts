import type {
  ApiBlobComponent,
  ApiBlobDocument,
  ApiBlobProject,
} from '@specfy/api/src/types/api';

const IGNORED_KEYS = [
  'id',
  'slug',
  'createdAt',
  'updatedAt',
  'blobId',
  'orgId',
] as const;

export const IGNORED_PROJECT_KEYS: Array<
  keyof NonNullable<ApiBlobProject['current']>
> = [...IGNORED_KEYS, 'name', 'githubRepository'];

export const IGNORED_COMPONENT_KEYS: Array<
  keyof NonNullable<ApiBlobComponent['current']>
> = [
  ...IGNORED_KEYS,
  'orgId',
  'projectId',
  'type',
  'typeId',
  'source',
  'sourceName',
  'sourcePath',
];

export const IGNORED_DOCUMENT_KEYS: Array<
  keyof NonNullable<ApiBlobDocument['current']>
> = [
  ...IGNORED_KEYS,
  'locked',
  'name',
  'type',
  'typeId',
  'source',
  'sourcePath',
];
