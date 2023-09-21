import { hDefHost, wDefHost } from './constants.js';
import { getBestHandlePosition } from './helpers.edges.js';
import type { ComputedFlow, Layout, LayoutEdge, Tree } from './types.js';

const paddingY = 30;
const paddingX = 30;
const paddingCompX = 100;
const paddingHost = 30;
const hostsPerRow = 2;
const compsPerRow = 2;

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
      isHost: node.data.type === 'hosting',
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

  layout.edges = computeLayoutEdges(flow, layout);

  return layout;
}

export function computeTreeLayout(
  trees: Tree[],
  nodes: ComputedFlow['nodes']
): Layout {
  let y = 20;
  let w = 0;
  let h = 0;
  let x = paddingHost;
  const subs: Array<{ id: string; layout: Layout }> = [];

  // Compute aggregate (host) first
  for (const tree of trees) {
    if (!tree.isHost) {
      continue;
    }
    subs.push({ id: tree.id, layout: computeTreeLayout(tree.childs, nodes) });
  }

  const layout: Layout = {
    nodes: [],
    edges: [],
    height: 0,
    width: 0,
    y: 0,
    x: 0,
  };

  // Place host first on the layout
  for (let index = 0; index < subs.length; index++) {
    const sub = subs[index];
    if (index > 0 && index % hostsPerRow === 0) {
      // Go back to the start of the line
      y = h + 20;
      x = paddingHost;
    } else if (index > 0) {
      // Add on the right of the previous element
      const prev = layout.nodes[layout.nodes.length - 1];
      x = prev.pos.x + prev.size.width + paddingX;
    } else if (index === 0) {
      y += 20; // compensate icon and name being outside the node
    }

    layout.nodes.push(...sub.layout.nodes);

    const node = nodes.find((n) => n.id === sub.id)!;
    layout.nodes.push({
      id: node.id,
      pos: { x, y },
      size: { width: sub.layout.width, height: sub.layout.height },
    });

    // increase the BB
    w = Math.max(w, x + sub.layout.width + paddingX);
    h = Math.max(h, y + sub.layout.height + paddingY);
  }

  // Then place the components
  for (let index = 0; index < trees.length; index++) {
    const tree = trees[index];
    if (tree.isHost) {
      continue;
    }

    if (index > 0 && index % compsPerRow === 0) {
      // Go back to the start of the line
      y = h;
      x = paddingHost;
    } else if (index > 0) {
      // Add on the right of the previous element
      const prev = layout.nodes[layout.nodes.length - 1];
      x = prev.pos.x + prev.size.width + paddingCompX;
    }

    const node = nodes.find((n) => n.id === tree.id)!;
    layout.nodes.push({
      id: node.id,
      pos: { x, y },
      size: node.data.originalSize,
    });

    // increase the BB
    h = Math.max(h, y + node.data.originalSize.height + paddingY);
    w = Math.max(w, x + node.data.originalSize.width + paddingCompX);
  }

  // Update the Bounding Box
  layout.height = Math.max(hDefHost, h);
  layout.width = Math.max(wDefHost, w);

  return layout;
}

export function computeLayoutEdges(
  flow: ComputedFlow,
  layout: Layout
): LayoutEdge[] {
  const edges: LayoutEdge[] = [];
  for (const edge of flow.edges) {
    const a = layout.nodes.find((n) => n.id === edge.source);
    const b = layout.nodes.find((n) => n.id === edge.target);
    if (!a || !b) {
      console.error('failed to find target or source');
      continue;
    }

    const handles = getBestHandlePosition(
      { ...a.size, positionAbsolute: a.pos },
      { ...b.size, positionAbsolute: b.pos }
    );
    edges.push({
      id: edge.id,
      sourceHandle: handles.newSource,
      targetHandle: handles.newTarget,
    });
  }

  return edges;
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
