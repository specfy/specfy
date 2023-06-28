import type {
  BlocksWithContent,
  BlockLevelZero,
} from '@specfy/api/src/types/api';

import { ContentBlock } from '../components/Content';

export interface Payload {
  displayed: string[];
}

export function map(
  block: BlocksWithContent,
  pl: Payload
): JSX.Element | JSX.Element[] {
  if (!block.content) {
    return <></>;
  }

  return block.content.map((blk, i) => {
    return <ContentBlock block={blk} key={i} pl={pl} />;
  });
}

export function removeEmptyContent(json: BlockLevelZero): BlockLevelZero {
  return json.content.length === 1 &&
    json.content[0].type === 'paragraph' &&
    !json.content[0].content
    ? { type: 'doc', content: [] }
    : json;
}

export function getEmptyDoc(withPlaceholder?: true): BlockLevelZero {
  return {
    type: 'doc',
    content: withPlaceholder ? [{ type: 'paragraph', attrs: { uid: '' } }] : [],
  };
}
