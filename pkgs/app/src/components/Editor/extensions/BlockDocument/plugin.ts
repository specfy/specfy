import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

export interface BlockDocumentOptions {
  HTMLAttributes: Record<string, any>;
}

import { BlockDocumentView } from './View';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    blockDocument: {
      /**
       * Set a blockquote node
       */
      setBlockDocument: () => ReturnType;
      /**
       * Toggle a blockquote node
       */
      toggleBlockDocument: () => ReturnType;
      /**
       * Unset a blockquote node
       */
      unsetBlockDocument: () => ReturnType;
    };
  }
}

export const BlockDocument = Node.create<BlockDocumentOptions>({
  name: 'blockDocument',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: 'block*',

  group: 'block',

  defining: true,

  addAttributes() {
    return {
      id: {
        default: 0,
        rendered: false,
      },
    };
  },

  renderHTML(a) {
    return ['div', mergeAttributes(a.HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlockDocumentView, {});
  },

  addCommands() {
    return {
      setBlockDocument:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name);
        },
      toggleBlockDocument:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name);
        },
      unsetBlockDocument:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});
