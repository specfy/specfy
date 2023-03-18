import { Extension } from '@tiptap/core';
import type { Node } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { nanoid } from 'api/src/common/id';

const isNodeHasAttribute = (node: Node, attrName: string) => {
  return Boolean(node.attrs?.[attrName]);
};

const attrName = 'uid';

export const BlockUid = Extension.create({
  name: 'blockUid',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('blockUid'),
        appendTransaction: (transactions, prevState, nextState) => {
          const tr = nextState.tr;
          const { text } = nextState.schema.nodes;
          let modified = false;
          if (transactions.some((transaction) => transaction.docChanged)) {
            // Adds a unique id to a node
            nextState.doc.descendants((node, pos) => {
              if (!isNodeHasAttribute(node, attrName) && node.type !== text) {
                tr.setNodeAttribute(pos, attrName, nanoid());
                modified = true;
              }
            });
          }

          return modified ? tr : null;
        },
      }),
    ];
  },
});
