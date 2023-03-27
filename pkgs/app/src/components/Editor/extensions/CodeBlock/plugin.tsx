import { mergeAttributes, Node, textblockTypeInputRule } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { ReactNodeViewRenderer } from '@tiptap/react';

import type { displayMap } from './View';
import { CodeBlockView } from './View';

export interface CodeBlockOptions {
  /**
   * Define whether the node should be exited on arrow down if there is no node after it.
   * Defaults to `true`.
   */
  exitOnArrowDown: boolean;
  /**
   * Custom HTML attributes that should be added to the rendered HTML tag.
   */
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    codeBlock: {
      /**
       * Set a code block
       */
      setCodeBlock: (attributes?: { language: string }) => ReturnType;
      /**
       * Toggle a code block
       */
      toggleCodeBlock: (attributes?: { language: string }) => ReturnType;
    };
  }
}

export const backtickInputRegex = /^```([a-z]+)?[\s\n]$/;
export const tildeInputRegex = /^~~~([a-z]+)?[\s\n]$/;

type LangKey = keyof typeof displayMap;
export const languages: Record<LangKey, LangKey> & Record<string, LangKey> = {
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  sh: 'bash',
  bash: 'bash',
  css: 'css',
  html: 'html',
};

export const CodeBlock = Node.create<CodeBlockOptions>({
  name: 'codeBlock',

  addOptions() {
    return {
      exitOnArrowDown: true,
      HTMLAttributes: {},
    };
  },

  content: 'text*',

  marks: '',

  group: 'block',

  code: true,

  isolating: true,

  defining: true,

  addAttributes() {
    return {
      language: {
        default: 'js',
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ];
  },

  renderHTML(a) {
    return ['div', mergeAttributes(a.HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView, {});
  },

  addCommands() {
    return {
      setCodeBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
      toggleCodeBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => {
        return this.editor.commands.toggleCodeBlock();
      },

      // remove code block when at start of document or code block is empty
      Backspace: () => {
        const { empty, $anchor } = this.editor.state.selection;
        const isAtStart = $anchor.pos === 1;

        if (!empty || $anchor.parent.type.name !== this.name) {
          return false;
        }

        if (isAtStart || !$anchor.parent.textContent.length) {
          return this.editor.commands.clearNodes();
        }

        return false;
      },

      // exit node on arrow down
      ArrowDown: ({ editor }) => {
        if (!this.options.exitOnArrowDown) {
          return false;
        }

        const { state } = editor;
        const { selection, doc } = state;
        const { $from, empty } = selection;

        if (!empty || $from.parent.type !== this.type) {
          return false;
        }

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2;

        if (!isAtEnd) {
          return false;
        }

        const after = $from.after();

        if (after === undefined) {
          return false;
        }

        const nodeAfter = doc.nodeAt(after);

        if (nodeAfter) {
          return false;
        }

        return editor.commands.exitCode();
      },

      'Shift-Tab': (p) => {
        const { $from, $to } = p.editor.state.selection;
        const { tr } = p.editor.state;

        // TODO: remove tab
        return true;
      },
      Tab: (p) => {
        const { $from } = p.editor.state.selection;

        if ($from.parent.type.name !== this.type.name) {
          return false;
        }

        const { tr } = p.editor.state;
        tr.insertText('  ', $from.pos);
        p.editor.view.dispatch(tr);

        return true;
      },
    };
  },

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: backtickInputRegex,
        type: this.type,
        getAttributes: (match) => {
          return {
            language: match[1] in languages ? languages[match[1]] : match[1],
          };
        },
      }),
      textblockTypeInputRule({
        find: tildeInputRegex,
        type: this.type,
        getAttributes: (match) => {
          return {
            language: match[1] in languages ? languages[match[1]] : match[1],
          };
        },
      }),
    ];
  },

  addProseMirrorPlugins() {
    return [
      // this plugin creates a code block for pasted content from VS Code
      // we can also detect the copied code language
      new Plugin({
        key: new PluginKey('codeBlockHighlight'),
        props: {
          handlePaste: (view, event) => {
            if (!event.clipboardData) {
              return false;
            }

            // don’t create a new code block within code blocks
            if (this.editor.isActive(this.type.name)) {
              return false;
            }

            const text = event.clipboardData.getData('text/plain');
            const vscode = event.clipboardData.getData('vscode-editor-data');
            const vscodeData = vscode ? JSON.parse(vscode) : undefined;
            const language = vscodeData?.mode;

            if (!text || !language) {
              return false;
            }

            const { tr } = view.state;

            // create an empty code block
            tr.replaceSelectionWith(this.type.create({ language }));

            // put cursor inside the newly created code block
            tr.setSelection(
              TextSelection.near(
                tr.doc.resolve(Math.max(0, tr.selection.from - 2))
              )
            );

            // add text to code block
            // strip carriage return chars from text pasted as code
            // see: https://github.com/ProseMirror/prosemirror-view/commit/a50a6bcceb4ce52ac8fcc6162488d8875613aacd
            tr.insertText(text.replace(/\r\n?/g, '\n'));

            // store meta information
            // this is useful for other plugins that depends on the paste event
            // like the paste rule plugin
            tr.setMeta('paste', true);

            view.dispatch(tr);

            return true;
          },
        },
      }),
    ];
  },
});
