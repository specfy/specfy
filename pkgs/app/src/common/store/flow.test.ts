import type { ComputedEdge } from '@specfy/models';
import { getBlobComponent } from '@specfy/models/src/components/test.utils';
import { createNode } from '@specfy/models/src/flows/transform';
import { describe, it, expect, afterEach } from 'vitest';

import { useFlowStore as store } from './flow';

afterEach(() => {
  store.setState({ flow: null });
});

describe('setCurrent', () => {
  it('should setCurrent flow', () => {
    const state = store.getState();
    state.setCurrent({ nodes: [], edges: [] });
    expect(store.getState().flow).toStrictEqual({
      nodes: [],
      edges: [],
    });
  });
});

describe('updateNode', () => {
  it("should update one node's position", () => {
    const state = store.getState();
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    state.setCurrent({ nodes: [node], edges: [] });
    state.updateNode([
      { type: 'position', id: node.id, position: { x: 10, y: 11 } },
    ]);
    expect(store.getState().flow?.nodes[0].position).toStrictEqual({
      x: 10,
      y: 11,
    });
  });
});

describe('updateEdge', () => {
  it("should update one node's position", () => {
    const state = store.getState();
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
    state.setCurrent({ nodes: [nodeA, nodeB], edges: [edge] });
    state.updateEdge([
      {
        type: 'changeTarget',
        id: edge.id,
        newSourceHandle: 'sb',
        newTargetHandle: 'tt',
        source: 'a',
        oldTarget: 'b',
        newTarget: 'b',
      },
    ]);
    expect(store.getState().flow?.edges[0]).toStrictEqual({
      id: 'a->b',
      source: 'a',
      sourceHandle: 'sb',
      target: 'b',
      targetHandle: 'tt',
    });
  });
});
