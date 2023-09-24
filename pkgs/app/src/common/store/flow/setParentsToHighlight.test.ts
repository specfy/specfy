/* eslint-disable import/extensions */
import { getBlobComponent } from '@specfy/models/src/components/test.utils';
import { createNode } from '@specfy/models/src/flows/transform';
import { describe, expect, it } from 'vitest';

import { setParentsToHighlight } from './setParentsToHighlight';

import cls from '@/components/Flow/index.module.scss';

describe('setParentsToHighlight', () => {
  it('should highlight host', () => {
    const host = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    host.data.type = 'hosting';
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));

    setParentsToHighlight(node, [node, host], [host.id]);
    expect(host.className).toBe(cls.highlightToGroup);
  });

  it('should not highlight service', () => {
    const host = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));

    setParentsToHighlight(node, [node, host], [host.id]);
    expect(host.className).toBe('');
  });

  it('should not highlight actual host', () => {
    const host = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    host.data.type = 'hosting';
    const node = createNode(getBlobComponent({ id: 'project', orgId: 'acme' }));
    node.parentNode = host.id;

    setParentsToHighlight(node, [node, host], [host.id]);
    expect(host.className).toBe('');
  });
});
