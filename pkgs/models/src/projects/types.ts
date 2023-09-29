import type { BlockLevelZero } from '../documents';

export interface DBProject {
  id: string;
  orgId: string;
  blobId: string | null;
  slug: string;
  name: string;
  description: BlockLevelZero;
  links: DBProjectLink[];
  createdAt: string;
  updatedAt: string;
}

export interface DBProjectLink {
  title: string;
  url: string;
}
