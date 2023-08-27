import type { BlockLevelZero } from '../documents';

export type ParsedUpload = {
  path: string;
  hash: string;
  content: BlockLevelZero;
};
