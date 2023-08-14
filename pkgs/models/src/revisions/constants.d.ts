import type { ApiBlobComponent, ApiBlobDocument, ApiBlobProject } from '../blobs';
export declare const flagRevisionApprovalEnabled: boolean;
export declare const flagRevisionDescRequired: boolean;
export declare const IGNORED_PROJECT_KEYS_CONST: readonly ["id", "slug", "createdAt", "updatedAt", "blobId", "orgId", "name", "githubRepository", "config"];
export declare const IGNORED_PROJECT_KEYS: ReadonlyArray<keyof NonNullable<ApiBlobProject['current']>>;
export declare const IGNORED_COMPONENT_KEYS_CONST: readonly ["id", "slug", "createdAt", "updatedAt", "blobId", "orgId", "orgId", "projectId", "type", "typeId", "source", "sourceName", "sourcePath"];
export declare const IGNORED_COMPONENT_KEYS: ReadonlyArray<keyof NonNullable<ApiBlobComponent['current']>>;
export declare const IGNORED_DOCUMENT_KEYS_CONST: readonly ["id", "slug", "createdAt", "updatedAt", "blobId", "orgId", "locked", "type", "typeId", "source", "sourcePath"];
export declare const IGNORED_DOCUMENT_KEYS: ReadonlyArray<keyof NonNullable<ApiBlobDocument['current']>>;
