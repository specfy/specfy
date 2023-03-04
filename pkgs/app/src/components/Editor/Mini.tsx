import { Bold } from '@tiptap/extension-bold';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Code } from '@tiptap/extension-code';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { History } from '@tiptap/extension-history';
import { Italic } from '@tiptap/extension-italic';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Text } from '@tiptap/extension-text';
import { useEditor, EditorContent } from '@tiptap/react';
import type { BlockLevelZero } from 'api/src/types/api';
import type React from 'react';
import { useMemo, useEffect } from 'react';

import { BubbleMenu } from './BubbleMenu';
import { removeEmptyContent } from './helpers';
import cls from './mini.module.scss';

const Editor: React.FC<{
  content: BlockLevelZero;
  minHeight?: string;
  limit?: number;
  onUpdate: (content: BlockLevelZero) => void;
}> = ({ content, limit, minHeight, onUpdate }) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      HardBreak,
      Code,
      Placeholder.configure({
        placeholder: 'Write something …',
      }),
      History.configure({
        depth: 100,
      }),
      CharacterCount.configure({
        limit,
      }),
    ],
    onUpdate: (e) => {
      onUpdate(removeEmptyContent(e.editor.getJSON() as any));
    },
    content:
      content.content.length === 0
        ? {
            type: 'doc',
            content: [{ type: 'paragraph' }],
          }
        : content,
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    editor.commands.setContent(content);
  }, [content]);

  return (
    <div>
      {editor && <BubbleMenu editor={editor} />}
      <EditorContent
        editor={editor}
        className={cls.editor}
        style={{ minHeight }}
      />
    </div>
  );
};

// TODO: delete or improve
// const ToolbarMini: React.FC<{
//   isUpdated: boolean;
//   onRevert: () => void;
// }> = ({ isUpdated, onRevert }) => {
//   return (
//     <div className={cls.toolbar}>
//       <div className={cls.hover}>
//         <Tooltip title="Revert all changes">
//           <Button
//             icon={<IconHistory />}
//             size="small"
//             className={classnames(isUpdated && cls.isUpdated)}
//             onClick={onRevert}
//           />
//         </Tooltip>
//       </div>
//     </div>
//   );
// };

export const EditorMini: React.FC<{
  doc: BlockLevelZero;
  onUpdate: (content: BlockLevelZero) => void;
}> = ({ doc, onUpdate }) => {
  // To prevent rerender
  const content = useMemo(() => {
    return doc;
  }, []);

  return (
    <div className={cls.mini}>
      <Editor content={content} onUpdate={onUpdate} />
      {/* <ToolbarMini isUpdated={isUpdated} onRevert={handleRevert} /> */}
    </div>
  );
};
