/* eslint-disable @typescript-eslint/consistent-type-assertions */
import type { ComputedEdge, ApiComponent } from '@specfy/models';
import { describe, it, expect, afterEach } from 'vitest';

import {
  handleEdgeChange,
  handleNodeChange,
  useComponentsStore as store,
} from './components';
import { original } from './original';

afterEach(() => {
  store.setState({ components: {} });
  original.store = [];
});

describe('fill', () => {
  it('should fill components', () => {
    const state = store.getState();
    state.fill([{ id: 'a' } as ApiComponent]);
    expect(store.getState().components).toStrictEqual({
      a: {
        id: 'a',
      },
    });
  });

  it('should override components', () => {
    const state = store.getState();
    state.fill([{ id: 'a' } as ApiComponent]);
    expect(store.getState().components).toStrictEqual({
      a: { id: 'a' },
    });
    state.fill([{ id: 'b' } as ApiComponent]);
    expect(store.getState().components).toStrictEqual({
      b: { id: 'b' },
    });
  });
});

describe('create', () => {
  it('should create component', () => {
    const state = store.getState();
    state.create({ id: 'a' } as ApiComponent);
    expect(store.getState().components).toStrictEqual({
      a: {
        id: 'a',
      },
    });
  });
});

describe('setCurrent', () => {
  it('should setCurrent component', () => {
    const state = store.getState();
    state.create({ id: 'a' } as ApiComponent);
    state.setCurrent('a');
    expect(store.getState().current).toBe('a');
  });
});

describe('select', () => {
  it('should select component', () => {
    const state = store.getState();
    state.create({ id: 'a' } as ApiComponent);
    expect(state.select('a')).toStrictEqual({ id: 'a' });
  });

  it('should not select component', () => {
    const state = store.getState();
    expect(state.select('b')).toBeUndefined();
  });
});

describe('update', () => {
  it('should update component', () => {
    const state = store.getState();
    state.create({ id: 'a' } as ApiComponent);
    state.update({ id: 'a', name: 'a' } as ApiComponent);
    expect(state.select('a')).toStrictEqual({ id: 'a', name: 'a' });
  });

  it('should not update component', () => {
    const state = store.getState();
    state.create({ id: 'a' } as ApiComponent);
    state.create({ id: 'b' } as ApiComponent);
    state.update({ id: 'b', name: 'b' } as ApiComponent);
    expect(state.select('a')).toStrictEqual({ id: 'a' });
    expect(state.select('b')).toStrictEqual({ id: 'b', name: 'b' });
  });
});

describe('updateField', () => {
  it('should update a field', () => {
    const state = store.getState();
    state.create({ id: 'a' } as ApiComponent);
    state.updateField('a', 'name', 'foobar');
    expect(state.select('a')).toStrictEqual({ id: 'a', name: 'foobar' });
  });
});

describe('revert', () => {
  it('should revert a component', () => {
    original.add({ id: 'a' } as ApiComponent);

    const state = store.getState();
    state.create({ id: 'a' } as ApiComponent);
    state.updateField('a', 'name', 'foobar');
    state.revert('a');
    expect(state.select('a')).toStrictEqual({ id: 'a' });
  });
});

describe('revertField', () => {
  it('should revert a component field', () => {
    original.add({ id: 'a', name: 'foobar' } as ApiComponent);

    const state = store.getState();
    state.create({ id: 'a', name: 'foobar' } as ApiComponent);
    state.updateField('a', 'name', 'barfoo');
    state.revertField('a', 'name');
    expect(state.select('a')).toStrictEqual({ id: 'a', name: 'foobar' });
  });
});

describe('setVisibility', () => {
  it('should hide a component', () => {
    const state = store.getState();
    state.create({
      id: 'a',
      edges: [],
      show: true,
      inComponent: { id: null },
    } as unknown as ApiComponent);
    state.setVisibility('a');
    expect(state.select('a')).toStrictEqual({
      id: 'a',
      show: false,
      edges: [],
      inComponent: { id: null },
    });
  });

  it('should show a component', () => {
    const state = store.getState();
    state.create({
      id: 'a',
      edges: [],
      show: false,
      inComponent: { id: null },
    } as unknown as ApiComponent);
    state.setVisibility('a');
    expect(state.select('a')).toStrictEqual({
      id: 'a',
      show: true,
      edges: [],
      inComponent: { id: null },
    });
  });

  it.each([true, false])('should show(%o) outgoing/incoming edges', (val) => {
    const state = store.getState();
    state.create({
      id: 'a',
      edges: [{ target: 'b' }],
      show: val,
      inComponent: { id: null },
    } as unknown as ApiComponent);
    state.create({
      id: 'b',
      edges: [{ target: 'a' }],
      show: true,
      inComponent: { id: null },
    } as unknown as ApiComponent);
    state.setVisibility('a');
    expect(state.select('a')).toStrictEqual({
      id: 'a',
      show: !val,
      edges: [{ target: 'b', show: !val }],
      inComponent: { id: null },
    });
    expect(state.select('b')).toStrictEqual({
      id: 'b',
      show: true,
      edges: [{ target: 'a', show: !val }],
      inComponent: { id: null },
    });
  });

  it('should not show outgoing edge if the target is hidden', () => {
    const state = store.getState();
    state.create({
      id: 'a',
      edges: [{ target: 'b', show: false }],
      show: false,
      inComponent: { id: null },
    } as unknown as ApiComponent);
    state.create({
      id: 'b',
      edges: [],
      show: false,
      inComponent: { id: null },
    } as unknown as ApiComponent);
    state.setVisibility('a');
    expect(state.select('a')).toStrictEqual({
      id: 'a',
      show: true,
      edges: [{ target: 'b', show: false }],
      inComponent: { id: null },
    });
  });

  it('should hide hosts and its nested component', () => {
    const state = store.getState();
    state.create({
      id: 'a',
      edges: [],
      show: true,
      inComponent: { id: null },
    } as unknown as ApiComponent);
    state.create({
      id: 'b',
      edges: [],
      show: true,
      inComponent: { id: 'a' },
    } as unknown as ApiComponent);
    state.setVisibility('a');
    expect(state.select('b')).toStrictEqual({
      id: 'b',
      show: false,
      inComponent: { id: 'a' },
      edges: [],
    });
  });

  it('should hide hosts and its nested hosts + component', () => {
    const state = store.getState();
    state.create({
      id: 'a',
      edges: [],
      show: true,
      type: 'hosting',
      inComponent: { id: null },
    } as unknown as ApiComponent);
    state.create({
      id: 'b',
      edges: [],
      show: true,
      type: 'hosting',
      inComponent: { id: 'a' },
    } as unknown as ApiComponent);
    state.create({
      id: 'c',
      edges: [],
      show: true,
      inComponent: { id: 'b' },
    } as unknown as ApiComponent);
    state.setVisibility('a');
    expect(state.select('b')!.show).toBe(false);
    expect(state.select('c')!.show).toBe(false);
  });
});

describe('remove', () => {
  it('should remove a component', () => {
    const state = store.getState();
    state.create({ id: 'a' } as unknown as ApiComponent);
    state.remove('a');
    expect(state.select('a')).toBeUndefined();
  });

  it('should remove incoming edges', () => {
    const state = store.getState();
    state.create({ id: 'a' } as unknown as ApiComponent);
    state.create({
      id: 'b',
      inComponent: { id: null },
      edges: [{ target: 'a' }],
    } as unknown as ApiComponent);
    state.remove('a');
    expect(state.select('b')).toStrictEqual({
      id: 'b',
      edges: [],
      inComponent: { id: null },
    });
  });

  it('should remove host and compute new position', () => {
    const state = store.getState();
    state.create({
      id: 'a',
      inComponent: { id: null },
      display: { pos: { x: 10, y: 10 } },
    } as unknown as ApiComponent);
    state.create({
      id: 'b',
      inComponent: { id: 'a' },
      edges: [],
      display: { pos: { x: 20, y: 20 } },
    } as unknown as ApiComponent);
    const stateBis = store.getState();
    stateBis.remove('a');
    expect(JSON.parse(JSON.stringify(state.select('b')))).toStrictEqual({
      id: 'b',
      edges: [],
      display: { pos: { x: 30, y: 30 } },
      inComponent: { id: null },
    });
  });
});

describe('addEdge', () => {
  it('should addEdge a component', () => {
    const state = store.getState();
    state.create({ id: 'a', edges: [] } as unknown as ApiComponent);
    state.addEdge({
      source: 'a',
      sourceHandle: 'st',
      target: 'b',
      targetHandle: 'tt',
    });
    const edges = state.select('a')?.edges;
    expect(edges).toHaveLength(1);
    expect(edges![0]).toMatchObject({ target: 'b' });
  });

  it('should dedup edges', () => {
    const state = store.getState();
    state.create({
      id: 'a',
      edges: [{ target: 'b', portTarget: 'tt' }],
    } as unknown as ApiComponent);
    state.addEdge({
      source: 'a',
      sourceHandle: 'st',
      target: 'b',
      targetHandle: 'tt',
    });
    const edges = state.select('a')?.edges;
    expect(edges).toHaveLength(1);
    expect(edges![0]).toMatchObject({ target: 'b' });
  });
});

describe('updateEdge', () => {
  it('should updateEdge', () => {
    const state = store.getState();
    state.create({
      id: 'a',
      edges: [{ target: 'b', portTarget: 'tt' }],
    } as unknown as ApiComponent);

    state.updateEdge('a', 'b', { portTarget: 'tb' });
    expect(state.select('a')?.edges[0]).toMatchObject({ portTarget: 'tb' });
  });
});

describe('removeEdge', () => {
  it('should removeEdge', () => {
    const state = store.getState();
    state.create({
      id: 'a',
      edges: [{ target: 'b', portTarget: 'tt' }],
    } as unknown as ApiComponent);

    state.removeEdge('a', 'b');
    expect(state.select('a')?.edges).toHaveLength(0);
  });

  it('should hide edge with source', () => {
    const state = store.getState();
    state.create({
      id: 'a',
      edges: [{ target: 'b', portTarget: 'tt', source: 'github' }],
    } as unknown as ApiComponent);

    state.removeEdge('a', 'b');
    expect(state.select('a')?.edges).toHaveLength(1);
    expect(state.select('a')?.edges[0].show).toBe(false);
  });
});

describe('handleNodeChange: remove', () => {
  it('should remove', () => {
    const state = store.getState();
    state.create({ id: 'a', source: null } as unknown as ApiComponent);
    handleNodeChange(state, { type: 'remove', id: 'a' });

    expect(state.select('a')).toBeUndefined();
  });
  it('should hide', () => {
    const state = store.getState();
    state.create({
      id: 'a',
      source: 'github',
      edges: [],
      inComponent: { id: null },
    } as unknown as ApiComponent);
    handleNodeChange(state, { type: 'remove', id: 'a' });

    expect(state.select('a')).toBeDefined();
    expect(state.select('a')?.show).toBe(false);
  });
});

describe('handleNodeChange: position', () => {
  it('should change position', () => {
    const state = store.getState();
    state.create({ id: 'a' } as unknown as ApiComponent);
    handleNodeChange(state, {
      type: 'position',
      id: 'a',
      position: { x: 10, y: 11 },
    });

    expect(state.select('a')!.display.pos).toStrictEqual({ x: 10, y: 11 });
  });
});

describe('handleNodeChange: group', () => {
  it('should group a node', () => {
    const state = store.getState();
    state.create({ id: 'a' } as unknown as ApiComponent);
    handleNodeChange(state, { type: 'group', id: 'a', parentId: 'b' });

    expect(state.select('a')!.inComponent).toStrictEqual({ id: 'b' });
  });
});

describe('handleNodeChange: ungroup', () => {
  it('should ungroup a node', () => {
    const state = store.getState();
    state.create({
      id: 'b',
      display: { pos: { x: 0, y: 0 } },
    } as unknown as ApiComponent);
    state.create({
      id: 'a',
      inComponent: { id: 'b' },
      display: { pos: { x: 0, y: 0 } },
    } as unknown as ApiComponent);
    handleNodeChange(state, { type: 'ungroup', id: 'a' });

    expect(state.select('a')!.inComponent).toStrictEqual({ id: null });
  });
});

describe('handleNodeChange: rename', () => {
  it('should rename a node', () => {
    const state = store.getState();
    state.create({ id: 'a' } as unknown as ApiComponent);
    handleNodeChange(state, { type: 'rename', id: 'a', name: 'foobar' });

    expect(state.select('a')!.name).toBe('foobar');
  });
});

describe('handleNodeChange: visibility', () => {
  it('should change visibility of a node (false)', () => {
    const state = store.getState();
    state.create({
      id: 'a',
      edges: [],
      inComponent: { id: null },
    } as unknown as ApiComponent);
    handleNodeChange(state, { type: 'visibility', id: 'a' });
    expect(state.select('a')!.show).toBe(false);
  });
  it('should change visibility of a node (true)', () => {
    const state = store.getState();
    state.create({
      id: 'a',
      edges: [],
      inComponent: { id: null },
    } as unknown as ApiComponent);
    handleNodeChange(state, { type: 'visibility', id: 'a' });
    handleNodeChange(state, { type: 'visibility', id: 'a' });
    expect(state.select('a')!.show).toBe(true);
  });
});

describe('handleEdgeChange: remove', () => {
  it('should remove an edge', () => {
    const state = store.getState();
    state.create({
      id: 'a',
      source: 'github',
      edges: [{ id: 'a->b', target: 'b' }],
    } as unknown as ApiComponent);
    handleEdgeChange(state, { type: 'remove', id: 'a->b' });

    expect(state.select('a')!.edges).toStrictEqual([]);
  });

  it('should hide an edge with source', () => {
    const state = store.getState();
    state.create({
      id: 'a',
      source: 'github',
      edges: [{ id: 'a->b', source: 'github', target: 'b' }],
    } as unknown as ApiComponent);
    handleEdgeChange(state, { type: 'remove', id: 'a->b' });

    expect(state.select('a')!.edges[0].show).toBe(false);
  });
});

describe('handleEdgeChange: changeTarget', () => {
  it('should keep edge hidden when updating', () => {
    // We don't want an edge to appear when moving around a component that was also hidden
    // unless it was specified

    const state = store.getState();
    const edge: ComputedEdge = {
      id: `a->b`,
      source: 'a',
      target: 'b',
      sourceHandle: 'sl',
      targetHandle: 'tr',
    };

    state.create({
      id: 'a',
      source: null,
      edges: [edge],
    } as unknown as ApiComponent);
    state.create({ id: 'b', source: null } as unknown as ApiComponent);

    handleEdgeChange(state, { type: 'visibility', id: `a->b` });
    expect(state.select('a')!.edges[0].show).toBe(false);
    handleEdgeChange(state, {
      type: 'changeTarget',
      id: `a->b`,
      source: 'a',
      oldTarget: 'b',
      newTarget: 'b',
      newSourceHandle: 'sb',
      newTargetHandle: 'tt',
    });

    expect(state.select('a')!.edges[0]).toStrictEqual({
      id: 'a->b',
      portSource: 'sb',
      portTarget: 'tt',
      show: false,
      source: 'a',
      sourceHandle: 'sl',
      target: 'b',
      targetHandle: 'tr',
    });

    // ... unless it was specified
    handleEdgeChange(state, {
      type: 'changeTarget',
      id: `a->b`,
      source: 'a',
      oldTarget: 'b',
      newTarget: 'b',
      newSourceHandle: 'sb',
      newTargetHandle: 'tt',
      show: true,
    });
    expect(state.select('a')!.edges[0].show).toBe(true);
  });
});
