// Adapted and ported to TS, from official example
// https://reactflow.dev/docs/examples/edges/simple-floating-edges/

import type { ComputedNode, HandlePosition } from './types.js';

type NodeFloatingEdge = Pick<
  ComputedNode,
  'positionAbsolute' | 'width' | 'height'
>;

export function getBestHandlePosition(
  nodeA: NodeFloatingEdge,
  nodeB: NodeFloatingEdge
): { newSource: HandlePosition; newTarget: HandlePosition } {
  const centerA = getNodeCenter(nodeA);
  const centerB = getNodeCenter(nodeB);

  const horizontalDiff = Math.abs(centerA.x - centerB.x);
  const verticalDiff = Math.abs(centerA.y - centerB.y);

  let positionSource: 'left' | 'right' | 'top' | 'bottom';
  let positionTarget: 'left' | 'right' | 'top' | 'bottom';

  if (horizontalDiff > verticalDiff) {
    // when the horizontal difference between the nodes is bigger, we use Position.Left or Position.Right for the handle
    positionSource = centerA.x > centerB.x ? 'left' : 'right';
    positionTarget = centerA.x > centerB.x ? 'right' : 'left';
  } else {
    // here the vertical difference between the nodes is bigger, so we use Position.Top or Position.Bottom for the handle
    positionSource = centerA.y > centerB.y ? 'top' : 'bottom';
    positionTarget = centerA.y > centerB.y ? 'bottom' : 'top';
  }

  return { newSource: positionSource, newTarget: positionTarget };
}

/**
 * Get node center of gravity
 */
export function getNodeCenter(node: NodeFloatingEdge) {
  return {
    x: node.positionAbsolute!.x + node.width! / 2,
    y: node.positionAbsolute!.y + node.height! / 2,
  };
}
