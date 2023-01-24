export interface DBContent {
  id: string;
  orgId: string;
  projectId: string;
  type: 'rfc';
  typeId: string;
  name: string;
  slug: string;
  create: string;
  update: string[];
  use: string[];
  remove: string[];
  tldr: string;
  blocks: Record<string, any>;
  authors: string[];
  reviewers: string[];
  approvedBy: string[];
  status: 'approved' | 'draft' | 'rejected';
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}
