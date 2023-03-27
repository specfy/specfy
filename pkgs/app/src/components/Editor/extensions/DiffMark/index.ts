import { Mark, mergeAttributes } from '@tiptap/react';

export const DiffMarkExtension = Mark.create({
  name: 'diffMark',

  addAttributes() {
    return {
      type: {
        renderHTML: ({ type }: { type: number }) => {
          const color = {
            [1]: '#bcf5bc',
            [-1]: '#ff8989',
          }[type];
          return {
            style: 'background-color: ' + color,
          };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
});
