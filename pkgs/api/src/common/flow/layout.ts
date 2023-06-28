import dagre from '@dagrejs/dagre';

import type { ComputedFlow } from './transform.js';

export function computeLayoutDagre(flow: ComputedFlow) {
  const g = new dagre.graphlib.Graph({
    compound: true,
  });
  g.setGraph({
    nodesep: 30,
    marginx: 0,
    marginy: 0,
    rankdir: 'LR',
    align: 'UL',
    ranksep: 30,
  });

  g.setDefaultEdgeLabel(() => ({}));

  for (const node of flow.nodes) {
    g.setNode(node.id, {
      label: node.data.label,
      width: node.data.originalSize.width,
      height: node.data.originalSize.height,
    });
    if (node.parentNode) {
      g.setParent(node.id, node.parentNode);
    }
  }

  for (const edge of flow.edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return g;
}

export interface LayoutNode {
  id: string;
  pos: { x: number; y: number };
  size: { width: number; height: number };
}
export interface Layout {
  nodes: LayoutNode[];
  x: number;
  y: number;
  width: number;
  height: number;
}

const paddingY = 20;
const paddingX = 20;
const paddingHost = 20;

export function computeLayoutSimple(flow: ComputedFlow): Layout {
  let y = 0;
  let w = 0;
  const x = paddingHost;

  const layout: Layout = { nodes: [] };

  // Component
  for (const node of flow.nodes) {
    if (node.data.type === 'hosting') {
      continue;
    }

    layout.nodes.push({
      id: node.id,
      pos: { x, y },
      size: node.data.originalSize,
    });
    y += node.data.originalSize.height + paddingY;
    w = Math.max(w, x + node.data.originalSize.width);
  }

  // Hosting
  for (const node of flow.nodes) {
    if (node.data.type !== 'hosting') {
      continue;
    }

    layout.nodes.push({
      id: node.id,
      pos: { x: 0, y: 0 },
      size: {
        width: w + paddingHost,
        height: y + paddingHost * 2,
      },
    });
  }

  return layout;
}

export interface Tree {
  id: string;
  parentId: string | null;
  childs: Tree[];
}
export function computeTree(
  nodes: ComputedFlow['nodes'],
  parentId: string | null = null
): Tree[] {
  const childs: Tree[] = [];
  for (const node of nodes) {
    if (parentId && node.parentNode !== parentId) {
      continue;
    }
    if (!parentId && node.parentNode) {
      continue;
    }

    childs.push({
      id: node.id,
      parentId,
      childs: computeTree(nodes, node.id),
    });
  }

  return childs;
}

export function computeLayout(flow: ComputedFlow): Layout {
  const trees = computeTree(flow.nodes);

  const layout = computeTreeLayout(trees, flow.nodes);

  return layout;
}

export function computeTreeLayout(
  trees: Tree[],
  nodes: ComputedFlow['nodes']
): Layout {
  let y = 20;
  let w = 0;
  const x = paddingHost;
  const subs: Array<{ id: string; layout: Layout }> = [];

  // Compute aggregate first
  for (const tree of trees) {
    if (tree.childs.length <= 0) {
      continue;
    }
    subs.push({ id: tree.id, layout: computeTreeLayout(tree.childs, nodes) });
  }

  const layout: Layout = { nodes: [], height: 0, width: 0, y: 0, x: 0 };

  for (const sub of subs) {
    layout.nodes.push(...sub.layout.nodes);

    const node = nodes.find((n) => n.id === sub.id)!;
    layout.nodes.push({
      id: node.id,
      pos: { x, y },
      size: { width: sub.layout.width, height: sub.layout.height },
    });
    w = Math.max(w, x + sub.layout.width + paddingY);
    y += sub.layout.height + paddingY;
  }

  for (const tree of trees) {
    if (tree.childs.length > 0) {
      continue;
    }

    const node = nodes.find((n) => n.id === tree.id)!;
    layout.nodes.push({
      id: node.id,
      pos: { x, y },
      size: node.data.originalSize,
    });
    y += node.data.originalSize.height + paddingY;
    w = Math.max(w, x + node.data.originalSize.width + paddingY);
  }

  layout.width = w;
  layout.height = y;

  return layout;
}
