import type { BlockCodeBlock } from '@specfy/models';

import { CodeHighlighter } from '../../CodeHighlighter';

export const BlockCode: React.FC<{ block: BlockCodeBlock }> = ({ block }) => {
  if (block.codeDiff) {
    return (
      <CodeHighlighter
        language={block.attrs.language}
        code={block.content?.[0].text}
      />
    );
  }

  return (
    <CodeHighlighter
      language={block.attrs.language}
      code={block.content?.[0].text}
    />
  );
};
