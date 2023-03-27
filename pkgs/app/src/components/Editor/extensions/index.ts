import { Blockquote } from '@tiptap/extension-blockquote';
import { Bold } from '@tiptap/extension-bold';
import { BulletList } from '@tiptap/extension-bullet-list';
import { Code } from '@tiptap/extension-code';
import { Document } from '@tiptap/extension-document';
import { Gapcursor } from '@tiptap/extension-gapcursor';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { History } from '@tiptap/extension-history';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Image } from '@tiptap/extension-image';
import { Italic } from '@tiptap/extension-italic';
import { Link } from '@tiptap/extension-link';
import { ListItem } from '@tiptap/extension-list-item';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { Text } from '@tiptap/extension-text';
import type { AnyExtension } from '@tiptap/react';

import { Banner } from './Banner';
import { BlockDocument } from './BlockDocument';
import { BlockUid } from './BlockUid';
import { CodeBlock } from './CodeBlock';
import { BubbleMenu as BubbleMenuPlugin } from './CustomBubbleMenu';
import { CustomFloatingMenu } from './CustomFloatingMenu';
import { DiffMarkExtension } from './DiffMark';
import { Step } from './Step';
import { Vote } from './Vote';
import { VoteItem } from './VoteItem';

/**
 * We wrap extensions to get all the names without listing a second time manually.
 */
function wrap(arr: AnyExtension[]) {
  const names = arr
    .map((ext) => {
      if (
        ext.type === 'extension' ||
        ext.type === 'mark' ||
        ext.name === 'doc' ||
        ext.name === 'text'
      ) {
        return null;
      }
      return ext.name;
    })
    .filter(Boolean);

  // We add a global attribute that add an uid for each block, allowing efficient diffing.
  const BlockUidOverloaded = BlockUid.extend({
    addGlobalAttributes() {
      return [
        {
          types: names,
          attributes: {
            uid: {
              default: null,
              rendered: false,
              keepOnSplit: false,
              isRequired: true,
            },
          },
        },
      ];
    },
  });

  return [...arr, BlockUidOverloaded];
}

export function createEditorSchema() {
  return {
    extensions: wrap([
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      HardBreak,
      Heading.configure({
        levels: [1, 2, 3, 4],
      }),
      BulletList,
      ListItem,
      Blockquote,
      CustomFloatingMenu,
      BubbleMenuPlugin,
      HorizontalRule,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
        lastColumnResizable: false,
        cellMinWidth: 50,
      }),
      TableCell,
      TableHeader,
      TableRow,
      Code.configure({
        HTMLAttributes: { spellcheck: 'false' },
      }),
      Link.configure({
        linkOnPaste: true,
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `Title ${node.attrs.level}`;
          }

          return 'Write something …';
        },
      }),
      Image,
      VoteItem,
      Vote,
      Banner,
      CodeBlock,
      BlockDocument,
      Step,
      Gapcursor,
      DiffMarkExtension,
      History.configure({
        depth: 100,
      }),
    ]),
  };
}

export function createMiniEditorSchema() {
  return {
    extensions: wrap([
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
    ]),
  };
}
