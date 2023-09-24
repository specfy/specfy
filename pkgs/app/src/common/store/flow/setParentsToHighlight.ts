/* eslint-disable import/extensions */
import type { ComputedNode } from '@specfy/models';

import cls from '@/components/Flow/index.module.scss';

/**
 * When dragging a node we highlight potential parents that could receive this node.
 */
export function setParentsToHighlight(
  node: ComputedNode,
  nodes: ComputedNode[],
  intersections: string[]
) {
  const exclude: string[] = [node.id];
  if (intersections.length <= 0) {
    for (const n of nodes) {
      n.className = '';
    }
    return;
  }

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

  for (const n of nodes) {
    if (n.data.type !== 'hosting') {
      n.className = '';
      continue;
    }

    // handle deep parent/child host
    if (exclude.includes(n.id)) {
      n.className = '';
      continue;
    }

    n.className = intersections.includes(n.id) ? cls.highlightToGroup : '';
  }
}
