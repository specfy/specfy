import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { StepView } from './View';

export interface StepOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    step: {
      /**
       * Set a blockquote node
       */
      setStep: () => ReturnType;
      /**
       * Toggle a blockquote node
       */
      toggleStep: () => ReturnType;
      /**
       * Unset a blockquote node
       */
      unsetStep: () => ReturnType;
    };
  }
}

export const Step = Node.create<StepOptions>({
  name: 'step',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: '(blockDocument|block)+',

  group: 'block',

  isolating: true,

  addAttributes() {
    return {
      stepId: {
        default: 0,
        rendered: false,
      },
    };
  },

  renderHTML(a) {
    return ['div', mergeAttributes(a.HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(StepView, {});
  },

  addCommands() {
    return {
      setStep:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name);
        },
      toggleStep:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name);
        },
      unsetStep:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});
