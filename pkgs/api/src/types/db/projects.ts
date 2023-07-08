import type { BlockLevelZero } from '../api/index.js';

export interface DBProject {
  id: string;
  orgId: string;
  blobId: string | null;
  slug: string;
  name: string;
  description: BlockLevelZero;
  links: DBProjectLink[];

  githubRepository: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface DBProjectLink {
  title: string;
  url: string;
}
