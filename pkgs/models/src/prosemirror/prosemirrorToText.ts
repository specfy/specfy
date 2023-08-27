import type { BlockLevelZero, Blocks } from '../documents';

export function prosemirrorToText(doc: BlockLevelZero) {
  return iterNode(doc as any);
}

function iterNode(node: Blocks): string {
  if (node.type === 'hardBreak') {
    return '\n';
  }
  if (node.type === 'text') {
    return node.text;
  }

  if ('content' in node && node.content) {
    return `${node.content.map((c) => iterNode(c)).join('')}\n`;
  }
  return '';
}
