import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { BannerView } from './View';

export type BannerOptions = {
  HTMLAttributes: Record<string, any>;
};

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    banner: {
      /**
       * Set a blockquote node
       */
      setBanner: () => ReturnType;
      /**
       * Toggle a blockquote node
       */
      toggleBanner: () => ReturnType;
      /**
       * Unset a blockquote node
       */
      unsetBanner: () => ReturnType;
    };
  }
}

export const Banner = Node.create<BannerOptions>({
  name: 'banner',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: 'paragraph+',

  group: 'block',

  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        rendered: false,
      },
    };
  },

  renderHTML(a) {
    return ['div', mergeAttributes(a.HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BannerView, {});
  },

  addCommands() {
    return {
      setBanner:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name);
        },
      toggleBanner:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name);
        },
      unsetBanner:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});
