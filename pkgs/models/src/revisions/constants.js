export const flagRevisionApprovalEnabled = false;
export const flagRevisionDescRequired = false;
const IGNORED_KEYS = [
    'id',
    'slug',
    'createdAt',
    'updatedAt',
    'blobId',
    'orgId',
];
export const IGNORED_PROJECT_KEYS_CONST = [
    ...IGNORED_KEYS,
    'name',
    'githubRepository',
    'config',
];
export const IGNORED_PROJECT_KEYS = IGNORED_PROJECT_KEYS_CONST;
export const IGNORED_COMPONENT_KEYS_CONST = [
    ...IGNORED_KEYS,
    'orgId',
    'projectId',
    'type',
    'typeId',
    'source',
    'sourceName',
    'sourcePath',
];
export const IGNORED_COMPONENT_KEYS = IGNORED_COMPONENT_KEYS_CONST;
export const IGNORED_DOCUMENT_KEYS_CONST = [
    ...IGNORED_KEYS,
    'locked',
    'type',
    'typeId',
    'source',
    'sourcePath',
];
export const IGNORED_DOCUMENT_KEYS = IGNORED_DOCUMENT_KEYS_CONST;
