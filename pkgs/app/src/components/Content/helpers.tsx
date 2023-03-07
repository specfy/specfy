import type { BlocksWithContent } from 'api/src/types/api';

import { ContentBlock } from '.';

export function map(block: BlocksWithContent): JSX.Element | JSX.Element[] {
  if (!block.content) {
    return <></>;
  }

  return block.content.map((blk, i) => {
    return <ContentBlock block={blk} key={i} />;
  });
}
