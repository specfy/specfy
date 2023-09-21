import type { ComputedEdge } from '@specfy/models';
import { getBlobComponent } from '@specfy/models/src/components/test.utils';
import { createNode } from '@specfy/models/src/flows/transform';
import { describe, expect, it } from 'vitest';

import { onDragComputeNewHandle } from './floatingEdge';

describe('onDragComputeNewHandle', () => {
  it('should not create an update when no edge', () => {
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    const res = onDragComputeNewHandle(node, [], () => {
      return undefined;
    });
    expect(res).toStrictEqual([]);
  });

  it('should not create an update when nothing changed', () => {
    const nodeA = createNode(
      getBlobComponent({ id: 'project', orgId: 'acme' })
    );
    const nodeB = createNode(
      getBlobComponent({ id: 'project', orgId: 'acme' })
    );
    const edge: ComputedEdge = {
      id: 'a->b',
      source: 'a',
      target: 'b',
      sourceHandle: 'sl',
      targetHandle: 'tr',
    };
    const res = onDragComputeNewHandle(nodeA, [edge], () => {
      return nodeB;
    });
    expect(res).toStrictEqual([]);
  });

  it('should create an update when nodeA changed', () => {
    const nodeA = createNode(
      getBlobComponent({ id: 'project', orgId: 'acme' })
    );
    const nodeB = createNode(
      getBlobComponent({ id: 'project', orgId: 'acme' })
    );
    const edge: ComputedEdge = {
      id: `${nodeA.id}->${nodeB.id}`,
      source: nodeA.id,
      target: nodeB.id,
      sourceHandle: 'sl',
      targetHandle: 'tr',
    };
    nodeA.positionAbsolute = { x: 100, y: 100 };
    nodeB.positionAbsolute = { x: 0, y: 0 };
    const res = onDragComputeNewHandle(nodeA, [edge], () => {
      return nodeB;
    });
    expect(res).toStrictEqual([
      {
        type: 'changeTarget',
        id: `${nodeA.id}->${nodeB.id}`,
        source: nodeA.id,
        oldTarget: nodeB.id,
        newTarget: nodeB.id,
        newSourceHandle: 'sb',
        newTargetHandle: 'tt',
      },
    ]);
  });
});
