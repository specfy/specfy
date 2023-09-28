import type { Prisma } from '@specfy/db';

import type { SyncConfig } from '../sync.js';
import type { RequiredDeep } from 'type-fest';

export type SourceSettingsGithub = RequiredDeep<
  Omit<SyncConfig, 'orgId' | 'projectId'>
>;

export type SourceWithProject = Prisma.SourcesGetPayload<{
  include: { Project: true };
}>;
