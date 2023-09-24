/* eslint-disable import/extensions */
import type { ComputedEdge } from '@specfy/models';
import { getBlobComponent } from '@specfy/models/src/components/test.utils';
import { createNode } from '@specfy/models/src/flows/transform';
import { describe, it, expect, afterEach } from 'vitest';

import { useFlowStore as store } from './index';

import cls from '@/components/Flow/index.module.scss';

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

  it('should hide a managed node inside a free host', () => {
    const state = store.getState();
    const host = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    host.data.type = 'hosting';
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    node.data.source = 'github';
    node.parentNode = host.id;
    state.setCurrent('', { nodes: [host, node], edges: [] });

    state.onNodesChange({
      getState() {
        return { nodeInternals: new Map() };
      },
    } as any)([{ type: 'remove', id: host.id }]);
    const state2 = store.getState().nodes;
    expect(state2).toHaveLength(1);
    expect(state2[0].hidden).toBe(true);
    expect(state2[0].parentNode).toBeUndefined();
  });
});

describe('updateNode - group', () => {
  it('should add a node to parent', () => {
    const state = store.getState();
    const host = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    host.data.type = 'hosting';
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    state.setCurrent('', { nodes: [host, node], edges: [] });

    state.highlightHoveredParents(node, [host.id]);
    expect(store.getState().nodes[0].className).toBe(cls.highlightToGroup);

    state.onNodesChange({
      getState() {
        return {
          nodeInternals: new Map([
            [node.id, { positionAbsolute: { x: 0, y: 0 } }],
            [host.id, { positionAbsolute: { x: 0, y: 0 } }],
          ]),
        };
      },
    } as any)([{ type: 'group', id: node.id, parentId: host.id }]);
    expect(store.getState().nodes[1].parentNode).toStrictEqual(host.id);
    expect(store.getState().nodes[0].className).toBe('');
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
