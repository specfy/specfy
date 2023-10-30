import type { Prisma } from '@specfy/db';

import type { SyncConfigFull } from '../sync.js';
import type { SetOptional } from 'type-fest';

export type SourceSettingsGithub = SetOptional<SyncConfigFull, 'git'>;

export type SourceWithProject = Prisma.SourcesGetPayload<{
  include: { Project: true };
}>;
