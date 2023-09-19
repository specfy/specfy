import type { ComputedEdge, ComputedNode, FlowEdge } from '@specfy/models';
import { Position } from 'reactflow';

import {
  mapSourceHandle,
  mapSourceHandleReverse,
  mapTargetHandle,
  mapTargetHandleReverse,
} from './constants';
import type { EdgeChangeSuper } from './helpers';

// Adapted and ported to TS, from official example
// https://reactflow.dev/docs/examples/edges/simple-floating-edges/

type NodeFloatingEdge = Pick<
  ComputedNode,
  'positionAbsolute' | 'width' | 'height'
>;

export function getUpdateHandle(
  nodeA: NodeFloatingEdge,
  nodeB: NodeFloatingEdge
): { newSource: Position; newTarget: Position } {
  const centerA = getNodeCenter(nodeA);
  const centerB = getNodeCenter(nodeB);

  const horizontalDiff = Math.abs(centerA.x - centerB.x);
  const verticalDiff = Math.abs(centerA.y - centerB.y);

  let positionSource: Position;
  let positionTarget: Position;

  if (horizontalDiff > verticalDiff) {
    // when the horizontal difference between the nodes is bigger, we use Position.Left or Position.Right for the handle
    positionSource = centerA.x > centerB.x ? Position.Left : Position.Right;
    positionTarget = centerA.x > centerB.x ? Position.Right : Position.Left;
  } else {
    // here the vertical difference between the nodes is bigger, so we use Position.Top or Position.Bottom for the handle
    positionSource = centerA.y > centerB.y ? Position.Top : Position.Bottom;
    positionTarget = centerA.y > centerB.y ? Position.Bottom : Position.Top;
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

export function onDragComputeNewHandle(
  node: ComputedNode,
  edges: ComputedEdge[],
  getNode: (id: string) => ComputedNode | undefined
): EdgeChangeSuper[] {
  // Move edges source and target handles depending on the node position
  const edgeUpdates: EdgeChangeSuper[] = [];
  for (const edge of edges) {
    if (edge.source !== node.id && edge.target !== node.id) {
      // Only check relevant edges
      continue;
    }

    // Get new handles' position
    let c: ReturnType<typeof getUpdateHandle>;
    if (edge.target === node.id) {
      c = getUpdateHandle(getNode(edge.source)!, node);
    } else {
      c = getUpdateHandle(node, getNode(edge.target)!);
    }

    if (
      mapSourceHandle[edge.sourceHandle as FlowEdge['portSource']] ===
        c.newSource &&
      mapTargetHandle[edge.targetHandle as FlowEdge['portTarget']] ===
        c.newTarget
    ) {
      // no change we skip an useless update
      continue;
    }

    edgeUpdates.push({
      type: 'changeTarget',
      id: edge.id,
      newSourceHandle: mapSourceHandleReverse[c.newSource],
      newTarget: edge.target,
      newTargetHandle: mapTargetHandleReverse[c.newTarget],
      oldTarget: edge.target,
      source: edge.source,
    });
  }
  return edgeUpdates;
}
