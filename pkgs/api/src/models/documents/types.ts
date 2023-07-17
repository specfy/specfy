import type { BlockLevelZero } from '../../types/api/index.js';

export enum DocumentType {
  'pb' = 'pb',
  'rfc' = 'rfc',
  'doc' = 'doc',
}
export interface DBDocument {
  id: string;
  orgId: string;
  projectId: string;
  blobId: string | null;

  type: keyof typeof DocumentType;
  typeId: number | null;

  source: string | null;
  sourcePath: string | null;
  parentId: string | null;

  name: string;
  slug: string;
  tldr: string;
  content: BlockLevelZero;
  locked: boolean;

  createdAt: string;
  updatedAt: string;
}
