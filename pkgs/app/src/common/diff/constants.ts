const IGNORED_KEYS = [
  'id',
  'slug',
  'createdAt',
  'updatedAt',
  'blobId',
  'orgId',
] as const;

export const IGNORED_PROJECT_KEYS = [...IGNORED_KEYS, 'name'] as const;
export const IGNORED_COMPONENT_KEYS = [
  ...IGNORED_KEYS,
  'orgId',
  'projectId',
  'type',
  'typeId',
] as const;
export const IGNORED_DOCUMENT_KEYS = [
  ...IGNORED_KEYS,
  'locked',
  'name',
  'type',
  'typeId',
] as const;
