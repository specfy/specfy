import { getBlobComponent } from '@specfy/models/src/components/test.utils';
import { createNode } from '@specfy/models/src/flows/transform';
import { describe, expect, it } from 'vitest';

import { autoExpand } from './autoExpand';

describe('autoExpand', () => {
  it('should return empty updates', () => {
    const host = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    host.width = 200;
    host.height = 80;
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    node.parentNode = host.id;
    expect(host.width).toBe(200);
    expect(host.height).toBe(80);

    autoExpand(node, [host, node]);
    expect(host.width).toBe(200);
    expect(host.height).toBe(80);
    expect(host.position).toStrictEqual({ x: 0, y: 0 });
  });

  it('should push left', () => {
    const host = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    host.id = 'a';
    host.width = 200;
    host.height = 80;
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    node.id = 'b';
    node.parentNode = host.id;
    node.position.x = -1;

    autoExpand(node, [host, node]);
    expect(host.width).toBe(201);
    expect(host.height).toBe(80);
    expect(host.position).toStrictEqual({ x: -1, y: 0 });
  });

  it('should push right', () => {
    const host = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    host.id = 'a';
    host.width = 200;
    host.height = 80;
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    node.id = 'b';
    node.parentNode = host.id;
    node.position.x = 100;

    autoExpand(node, [host, node]);
    expect(host.width).toBe(235);
    expect(host.height).toBe(80);
    expect(host.position).toStrictEqual({ x: 0, y: 0 });
  });

  it('should push top', () => {
    const host = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    host.id = 'a';
    host.width = 200;
    host.height = 80;
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    node.id = 'b';
    node.parentNode = host.id;
    node.position.y = -1;

    autoExpand(node, [host, node]);
    expect(host.width).toBe(200);
    expect(host.height).toBe(81);
    expect(host.position).toStrictEqual({ x: 0, y: -1 });
  });

  it('should push bot', () => {
    const host = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    host.id = 'a';
    host.width = 200;
    host.height = 80;
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    node.id = 'b';
    node.parentNode = host.id;
    node.position.y = 100;

    autoExpand(node, [host, node]);
    expect(host.width).toBe(200);
    expect(host.height).toBe(145);
    expect(host.position).toStrictEqual({ x: 0, y: 0 });
  });
});
