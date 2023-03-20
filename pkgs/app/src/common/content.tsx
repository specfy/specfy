import type { Editor } from '@tiptap/core';
import { Schema } from '@tiptap/pm/model';
import type {
  BlocksWithContent,
  BlockDoc,
  BlockLevelZero,
} from 'api/src/types/api';

import { ContentBlock } from '../components/Content';

export interface Payload {
  displayed: string[];
}

export function map(
  block: BlocksWithContent,
  pl: Payload
): JSX.Element | JSX.Element[] {
  if (!block.content) {
    return <></>;
  }

  return block.content.map((blk, i) => {
    return <ContentBlock block={blk} key={i} pl={pl} />;
  });
}

export function removeEmptyContent(json: BlockDoc): BlockLevelZero {
  return json.content.length === 1 &&
    json.content[0].type === 'paragraph' &&
    !json.content[0].content
    ? { type: 'doc', content: [] }
    : json;
}

export function getEmptyDoc(withPlaceholder?: true): BlockLevelZero {
  return {
    type: 'doc',
    content: withPlaceholder ? [{ type: 'paragraph', attrs: { uid: '' } }] : [],
  };
}

export function addUidToSchema(editor: Editor) {
  const schema = editor.schema;
  const spec = schema.spec;

  // We add uid to all extensions
  for (const node of Object.values(schema.nodes)) {
    if (node.name === 'text' || node.name === 'doc') {
      continue;
    }

    const def = spec.nodes.get(node.name)!;
    spec.nodes = spec.nodes.update(node.name, {
      ...def,
      attrs: {
        ...def.attrs,
        uid: {
          default: null,
        },
      },
    });
  }

  editor.schema = new Schema({
    nodes: spec.nodes,
    marks: spec.marks,
    topNode: spec.topNode,
  });
}
