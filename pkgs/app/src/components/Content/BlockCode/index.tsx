import type { BlockCodeBlock } from '@specfy/models';

import { CodeHighlighter } from '../../CodeHighlighter';

export const BlockCode: React.FC<{ block: BlockCodeBlock }> = ({ block }) => {
  if (block.codeDiff) {
    // Very naive but displaying a good diff takes 1mb with react-diff-view & refractor
    // And it's not compatible with refractor 4 which is problematic
    // TODO: make it so that we have diff and language color
    return (
      <CodeHighlighter
        language={'diff'}
        code={block.codeDiff.hunks[0].changes
          .map((line) => {
            if (line.type === 'delete') return `-${line.content}`;
            if (line.type === 'insert') return `+${line.content}`;
            return line.content;
          })
          .join('\n')}
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
