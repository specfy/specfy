import type { RequiredDeep } from 'type-fest';

import type { BlockLevelZero } from '../documents';
import type { SyncConfig } from '../sync';

export interface DBProject {
  id: string;
  orgId: string;
  blobId: string | null;
  slug: string;
  name: string;
  description: BlockLevelZero;
  links: DBProjectLink[];

  githubRepository: string | null;
  config: RequiredDeep<Omit<SyncConfig, 'orgId' | 'projectId'>>;

  createdAt: string;
  updatedAt: string;
}

export interface DBProjectLink {
  title: string;
  url: string;
}
