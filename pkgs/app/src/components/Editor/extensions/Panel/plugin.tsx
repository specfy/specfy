import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { PanelView } from './View';

export type PanelOptions = {
  HTMLAttributes: Record<string, any>;
};

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    panel: {
      /**
       * Set a blockquote node
       */
      setPanel: () => ReturnType;
      /**
       * Toggle a blockquote node
       */
      togglePanel: () => ReturnType;
      /**
       * Unset a blockquote node
       */
      unsetPanel: () => ReturnType;
    };
  }
}

export const Panel = Node.create<PanelOptions>({
  name: 'panel',

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
    return ReactNodeViewRenderer(PanelView, {});
  },

  addCommands() {
    return {
      setPanel:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name);
        },
      togglePanel:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name);
        },
      unsetPanel:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});
