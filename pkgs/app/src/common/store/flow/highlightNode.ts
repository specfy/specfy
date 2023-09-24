/* eslint-disable import/extensions */
import type { ComputedEdge, ComputedNode } from '@specfy/models';
import classNames from 'classnames';

import cls from '@/components/Flow/index.module.scss';

export function highlightNode(
  id: string,
  nodes: ComputedNode[],
  edges: ComputedEdge[]
) {
  const related = new Set<string>();

  // Update edges and find related nodes
  for (const edge of edges) {
    const isSource = edge.source === id;
    const isTarget = edge.target === id;
    if (isSource) {
      related.add(edge.target);
    } else if (isTarget) {
      related.add(edge.source);
    } else {
      edge.className = undefined;
      continue;
    }

    let anim: string = cls.animateReadLine;
    if (isSource && edge.data!.write) {
      anim = cls.animateWriteLine;
    } else if (isTarget && edge.data!.write) {
      anim = cls.animateWriteLine;
    }

    edge.className = classNames(cls.show, anim);
  }

  // Update nodes
  for (const node of nodes) {
    if (node.id !== id && !related.has(node.id) && node.parentNode !== id) {
      node.className = node.className
        ? node.className.replace(cls.show, '')
        : '';
      continue;
    }

    node.className = node.className?.includes(cls.show)
      ? node.className
      : classNames(node.className, cls.show);
  }
}
