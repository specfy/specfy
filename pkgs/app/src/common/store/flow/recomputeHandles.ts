import type { ComputedEdge, ComputedNode, FlowEdge } from '@specfy/models';
import {
  mapSourceHandle,
  mapSourceHandleReverse,
  mapTargetHandle,
  mapTargetHandleReverse,
} from '@specfy/models/src/flows/constants';
import { getBestHandlePosition } from '@specfy/models/src/flows/helpers.edges';

export function recomputeHandles(
  node: ComputedNode,
  nodes: ComputedNode[],
  edges: ComputedEdge[]
): void {
  // Move edges source and target handles depending on the node position
  for (const edge of edges) {
    if (edge.source !== node.id && edge.target !== node.id) {
      // Only check relevant edges
      continue;
    }

    // Get new handles' position
    let c: ReturnType<typeof getBestHandlePosition>;
    if (edge.target === node.id) {
      c = getBestHandlePosition(nodes.find((n) => n.id === edge.source)!, node);
    } else {
      c = getBestHandlePosition(node, nodes.find((n) => n.id === edge.target)!);
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

    edge.sourceHandle = mapSourceHandleReverse[c.newSource];
    edge.targetHandle = mapTargetHandleReverse[c.newTarget];
  }
}
