import type { ComputedNode } from '@specfy/models';
import type { useStoreApi, ShouldResize } from 'reactflow';

export const shouldResize: (
  id: string,
  type: string,
  store: ReturnType<typeof useStoreApi>
) => ShouldResize = (id, type, store) => {
  return (evt, params) => {
    if (type !== 'hosting') {
      return true;
    }
    const { nodeInternals } = store.getState();
    const nodes: ComputedNode[] = [];
    nodeInternals.forEach((n) => {
      if (n.parentNode === id) {
        nodes.push(n);
      }
    });
    const bb = getNodesBoundingBox(nodes);
    console.log(bb, params);
    // return params.width > bb.console.log(nodes);
    if (params.direction[0] < 0 && params.width <= bb.width) {
      return false;
    }
    if (params.direction[1] != 0 && params.height < bb.height) {
      return false;
    }
    return true;
  };
};

function getNodesBoundingBox(nodes: ComputedNode[]): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const global = { x: 0, y: 0, width: 0, height: 0 };
  for (const node of nodes) {
    if (node.hidden) {
      continue;
    }

    global.x = Math.min(global.x, node.position.x);
    global.y = Math.min(global.y, node.position!.y);
    global.width = Math.max(global.width, node.position!.x + node.width!);
    global.height = Math.max(global.height, node.position!.y + node.height!);
  }
  global.width += 40;
  global.height += 40;

  return global;
}
