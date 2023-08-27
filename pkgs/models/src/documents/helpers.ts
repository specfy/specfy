import { createHash } from 'node:crypto';

import type { BlockLevelZero } from './types.prosemirror.js';

export function hashDocument(content: BlockLevelZero | string) {
  return createHash('sha256')
    .update(typeof content === 'string' ? content : JSON.stringify(content))
    .digest('hex');
}
