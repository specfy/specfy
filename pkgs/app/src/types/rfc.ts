import type { BlockLevelOne } from './content';

export interface RFCInterface {
  id: string;
  type: 'rfc';
  typeId: string;
  name: string;
  slug: string;
  create: string;
  update: string[];
  use: string[];
  remove: string[];
  tldr: string;
  blocks: BlockLevelOne[];
  authors: string[];
  reviewers: string[];
  approvedBy: string[];
  status: 'approved' | 'draft' | 'rejected';
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}
