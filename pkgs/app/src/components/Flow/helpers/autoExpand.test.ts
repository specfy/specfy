import { getBlobComponent } from '@specfy/models/src/components/test.utils';
import { createNode } from '@specfy/models/src/flows/transform';
import { describe, expect, it } from 'vitest';

import { autoExpand } from './autoExpand';

describe('autoExpand', () => {
  it('should return empty updates', () => {
    const host = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    node.parentNode = host.id;
    const updates = autoExpand({ nodes: [host, node], edges: [] }, node, {
      movementX: 0,
      movementY: 0,
    });
    expect(updates).toStrictEqual([]);
  });

  it('should push left', () => {
    const host = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    host.id = 'a';
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    node.id = 'b';
    node.parentNode = host.id;
    const updates = autoExpand({ nodes: [host, node], edges: [] }, node, {
      movementX: -1,
      movementY: 0,
    });
    expect(updates).toMatchSnapshot();
  });

  it('should push right', () => {
    const host = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    host.id = 'a';
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    node.id = 'b';
    node.parentNode = host.id;
    const updates = autoExpand({ nodes: [host, node], edges: [] }, node, {
      movementX: 100,
      movementY: 0,
    });
    expect(updates).toMatchSnapshot();
  });

  it('should push top', () => {
    const host = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    host.id = 'a';
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    node.id = 'b';
    node.parentNode = host.id;
    const updates = autoExpand({ nodes: [host, node], edges: [] }, node, {
      movementX: 0,
      movementY: -1,
    });
    expect(updates).toMatchSnapshot();
  });

  it('should push bot', () => {
    const host = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    host.id = 'a';
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    node.id = 'b';
    node.parentNode = host.id;
    const updates = autoExpand({ nodes: [host, node], edges: [] }, node, {
      movementX: 0,
      movementY: 100,
    });
    expect(updates).toMatchSnapshot();
  });
});
