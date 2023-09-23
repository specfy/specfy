import type { ComputedFlow, ComputedNode } from '@specfy/models';

import cls from '../index.module.scss';

/**
 * When dragging a node we highlight potential parents that could receive this node.
 */
export function getParentsToHighlight(
  nodes: ComputedNode[],
  intersections: string[],
  node: ComputedNode
) {
  const exclude: string[] = [node.id];

  // Compute parents list so we don't highlight them
  let parent = node.parentNode;
  while (parent) {
    exclude.push(parent);
    parent = nodes.find((n) => n.id === parent)?.parentNode;
  }

  // Compute childs too
  for (const el of nodes) {
    if (el.data.type !== 'hosting') continue;
    if (exclude.includes(el.id)) continue;

    const chains = [el.id];
    let par = el.parentNode;
    let i = 0;
    while (par && i < 9999) {
      i += 1;

      // One of the parent of this node is the original node we are moving
      if (par === node.id) {
        exclude.push(...chains);
        break;
      }

      chains.push(par);
      par = nodes.find((n) => n.id === parent)?.parentNode;
    }
  }

  return nodes.map((n) => {
    if (n.data.type !== 'hosting') {
      return n;
    }

    // handle deep parent/child host
    if (exclude.includes(n.id)) {
      return n;
    }

    return {
      ...n,
      className: intersections.includes(n.id) ? cls.highlightToGroup : '',
    };
  });
}
