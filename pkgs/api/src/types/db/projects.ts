import type { BlockLevelZero } from '../api';

export interface DBProject {
  id: string;
  orgId: string;
  blobId: string;
  slug: string;
  name: string;
  description: BlockLevelZero;
  links: DBProjectLink[];

  createdAt: string;
  updatedAt: string;
}

export interface DBProjectLink {
  title: string;
  link: string;
}
