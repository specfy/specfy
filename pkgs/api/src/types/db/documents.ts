import type { BlockLevelZero } from '../api';

export enum DocumentType {
  'pb' = 'pb',
  'rfc' = 'rfc',
}
export interface DBDocument {
  id: string;
  orgId: string;
  projectId: string;
  blobId: string;

  type: 'pb' | 'rfc';
  typeId: number;

  name: string;
  slug: string;
  tldr: string;
  content: BlockLevelZero;
  locked: boolean;

  createdAt: string;
  updatedAt: string;
}
