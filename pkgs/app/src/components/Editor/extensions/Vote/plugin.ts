import { mergeAttributes, Node } from '@tiptap/core';

export interface VoteOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    vote: {
      /**
       * Set a blockquote node
       */
      setVote: () => ReturnType;
      /**
       * Toggle a blockquote node
       */
      toggleVote: () => ReturnType;
      /**
       * Unset a blockquote node
       */
      unsetVote: () => ReturnType;
    };
  }
}

export const Vote = Node.create<VoteOptions>({
  name: 'vote',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: 'paragraph+',

  group: 'block',

  defining: true,

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setVote:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name);
        },
      toggleVote:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name);
        },
      unsetVote:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});
