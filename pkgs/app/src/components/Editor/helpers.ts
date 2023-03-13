import type { BlockDoc, BlockLevelZero } from 'api/src/types/api';

export function removeEmptyContent(json: BlockDoc): BlockLevelZero {
  return json.content.length === 1 &&
    json.content[0].type === 'paragraph' &&
    !json.content[0].content
    ? { type: 'doc', content: [] }
    : json;
}

export function getEmptyDoc(): BlockLevelZero {
  return {
    type: 'doc',
    content: [],
  };
}
