import type { ComputedEdge } from '@specfy/models';
import { getBlobComponent } from '@specfy/models/src/components/test.utils';
import { createNode } from '@specfy/models/src/flows/transform';
import { describe, expect, it } from 'vitest';

import { recomputeHandles } from './recomputeHandles';

describe('recomputeHandles', () => {
  it('should not create an update when no edge', () => {
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));

    const res = recomputeHandles(node, [], []);
    expect(res).toBeUndefined();
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

    recomputeHandles(nodeA, [nodeB], [edge]);
    expect(edge.sourceHandle).toBe('sl');
    expect(edge.targetHandle).toBe('tr');
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
    nodeA.positionAbsolute = { x: -100, y: -100 };
    nodeB.positionAbsolute = { x: 0, y: 0 };

    recomputeHandles(nodeA, [nodeB], [edge]);
    expect(edge.sourceHandle).toBe('sb');
    expect(edge.targetHandle).toBe('tt');
  });
});
