import type { BlockLevelZero } from '../api';

export interface DBPolicy {
  id: string;
  orgId: string;

  type: 'template_revision' | 'template_rfc';
  content: BlockLevelZero;

  createdAt: string;
  updatedAt: string;
}
