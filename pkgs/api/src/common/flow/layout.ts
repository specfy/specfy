import type { ComputedFlow, Layout, Tree } from './types.js';

const paddingY = 20;
const paddingX = 20;
const paddingHost = 20;

/**
 * Compute a nested tree representing Flow.nodes .
 */
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

/**
 * Depth first algorithm.
 *
 * To compute a layout we:
 * - Build a tree that will allow us to compute Bounding box of an "Host"
 * - We go at the deepest level, when there is no more host available
 * - We compute place the components and compute the BB
 * - Once we have the BB, we go back one level
 * - At this level, we know exactly how big the childs are so we can also compute the BB + padding
 * - etc. until level 0
 */
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

  // Compute aggregate (host) first
  for (const tree of trees) {
    if (tree.childs.length <= 0) {
      continue;
    }
    subs.push({ id: tree.id, layout: computeTreeLayout(tree.childs, nodes) });
  }

  const layout: Layout = { nodes: [], height: 0, width: 0, y: 0, x: 0 };

  // Place host first on the layout
  for (const sub of subs) {
    layout.nodes.push(...sub.layout.nodes);

    const node = nodes.find((n) => n.id === sub.id)!;
    layout.nodes.push({
      id: node.id,
      pos: { x, y },
      size: { width: sub.layout.width, height: sub.layout.height },
    });

    // increase the BB
    w = Math.max(w, x + sub.layout.width + paddingX);
    y += sub.layout.height + paddingY;
  }

  // Then place the components
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

    // increase the BB
    y += node.data.originalSize.height + paddingY;
    w = Math.max(w, x + node.data.originalSize.width + paddingX);
  }

  // Update the Bounding Box
  layout.height = y;
  layout.width = w;

  return layout;
}

/**
 * Apply the computed layout to the Flow.
 * This will modify the reference.
 */
export function applyLayout(layout: Layout, flow: ComputedFlow) {
  for (const node of flow.nodes) {
    const rel = layout.nodes.find((l) => l.id === node.id)!;
    node.position = rel.pos;
    node.style = {
      width: `${rel.size.width}px`,
      height: `${rel.size.height}px`,
    };
  }
}
