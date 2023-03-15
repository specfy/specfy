import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

export interface VoteItemOptions {
  HTMLAttributes: Record<string, any>;
}

import { VoteItemView } from './View';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    voteItem: {
      /**
       * Set a blockquote node
       */
      setVoteItem: () => ReturnType;
      /**
       * Toggle a blockquote node
       */
      toggleVoteItem: () => ReturnType;
      /**
       * Unset a blockquote node
       */
      unsetVoteItem: () => ReturnType;
    };
  }
}

export const VoteItem = Node.create<VoteItemOptions>({
  name: 'voteItem',

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
      voteChoice: {
        default: 0,
        rendered: false,
      },
    };
  },

  renderHTML(a) {
    return ['div', mergeAttributes(a.HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VoteItemView, {});
  },

  addCommands() {
    return {
      setVoteItem:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name);
        },
      toggleVoteItem:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name);
        },
      unsetVoteItem:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});
