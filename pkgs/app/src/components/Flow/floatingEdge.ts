import type { ComputedEdge, ComputedNode, FlowEdge } from '@specfy/models';
import {
  mapSourceHandle,
  mapSourceHandleReverse,
  mapTargetHandle,
  mapTargetHandleReverse,
} from '@specfy/models/src/flows/constants';
import { getBestHandlePosition } from '@specfy/models/src/flows/helpers.edges';

import type { EdgeChangeSuper } from './helpers';

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
    let c: ReturnType<typeof getBestHandlePosition>;
    if (edge.target === node.id) {
      c = getBestHandlePosition(getNode(edge.source)!, node);
    } else {
      c = getBestHandlePosition(node, getNode(edge.target)!);
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
