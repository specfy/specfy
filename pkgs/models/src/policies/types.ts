import type { BlockLevelZero } from '../documents';

export interface DBPolicy {
  id: string;
  orgId: string;

  type: 'ban' | 'promote' | 'template_revision' | 'template_rfc';
  name: string | null;
  tech: string | null;
  content: BlockLevelZero;

  createdAt: string;
  updatedAt: string;
}
