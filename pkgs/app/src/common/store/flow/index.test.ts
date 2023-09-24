import type { ComputedEdge } from '@specfy/models';
import { getBlobComponent } from '@specfy/models/src/components/test.utils';
import { createNode } from '@specfy/models/src/flows/transform';
import { describe, it, expect, afterEach } from 'vitest';

import { useFlowStore as store } from '.';

afterEach(() => {
  store.setState({ nodes: [], edges: [], nodeSelected: null });
});

describe('setCurrent', () => {
  it('should setCurrent flow', () => {
    const state = store.getState();
    state.setCurrent('', { nodes: [], edges: [] });
    expect(store.getState().nodes).toStrictEqual([]);
    expect(store.getState().nodes).toStrictEqual([]);
  });
});

describe('updateNode - position', () => {
  it("should update one node's position", () => {
    const state = store.getState();
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    state.setCurrent('', { nodes: [node], edges: [] });
    state.onNodesChange({
      getState() {
        return { nodeInternals: new Map() };
      },
    } as any)([{ type: 'position', id: node.id, position: { x: 10, y: 11 } }]);
    expect(store.getState().nodes[0].position).toStrictEqual({
      x: 10,
      y: 11,
    });
  });
});

describe('updateNode - add', () => {
  it.each([true, false])('should create a node with proper meta', (val) => {
    const state = store.getState();
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    state.setCurrent('', { nodes: [], edges: [] });
    state.setMeta({ readOnly: !val, connectable: val });

    state.onNodesChange({
      getState() {
        return { nodeInternals: new Map() };
      },
    } as any)([{ type: 'add', item: node }]);
    expect(store.getState().nodes[0].connectable).toBe(val);
  });
});

describe('updateNode - delete', () => {
  it('should remove a node', () => {
    const state = store.getState();
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    state.setCurrent('', { nodes: [node], edges: [] });

    state.onNodesChange({
      getState() {
        return { nodeInternals: new Map() };
      },
    } as any)([{ type: 'remove', id: node.id }]);
    expect(store.getState().nodes).toStrictEqual([]);
  });
  it('should hide a managed node', () => {
    const state = store.getState();
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    node.data.source = 'github';
    state.setCurrent('', { nodes: [node], edges: [] });

    state.onNodesChange({
      getState() {
        return { nodeInternals: new Map() };
      },
    } as any)([{ type: 'remove', id: node.id }]);
    expect(store.getState().nodes).toHaveLength(1);
    expect(store.getState().nodes[0].hidden).toBe(true);
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
    state.setCurrent('', { nodes: [nodeA, nodeB], edges: [edge] });
    state.onEdgesChange([
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
    expect(store.getState().edges[0]).toStrictEqual({
      id: 'a->b',
      source: 'a',
      sourceHandle: 'sb',
      target: 'b',
      targetHandle: 'tt',
      hidden: false,
    });
  });
});
