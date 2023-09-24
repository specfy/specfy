/* eslint-disable import/extensions */
import type { ComputedEdge } from '@specfy/models';
import { getBlobComponent } from '@specfy/models/src/components/test.utils';
import { createNode } from '@specfy/models/src/flows/transform';
import { describe, expect, it } from 'vitest';

import { highlightNode } from './highlightNode';

import cls from '@/components/Flow/index.module.scss';

describe('highlightNode', () => {
  it('should highlight B', () => {
    const nodeA = createNode(
      getBlobComponent({ id: 'project', orgId: 'acme' })
    );
    const nodeB = createNode(
      getBlobComponent({ id: 'project', orgId: 'acme' })
    );

    highlightNode(nodeB.id, [nodeA, nodeB], []);
    expect(nodeA.className).toBe('');
    expect(nodeB.className).toBe(cls.show);
  });

  it('should highlight B and the edges', () => {
    const nodeA = createNode(
      getBlobComponent({ id: 'project', orgId: 'acme' })
    );
    const nodeB = createNode(
      getBlobComponent({ id: 'project', orgId: 'acme' })
    );
    const edge: ComputedEdge = {
      id: 'a->b',
      source: nodeA.id,
      target: nodeB.id,
      sourceHandle: 'sl',
      targetHandle: 'tr',
      data: {
        read: true,
        write: true,
      },
    };

    highlightNode(nodeB.id, [nodeA, nodeB], [edge]);
    expect(nodeA.className).toBe(cls.show);
    expect(nodeB.className).toBe(cls.show);
    expect(edge.className).toBe(`${cls.show} ${cls.animateWriteLine}`);
  });

  it('should remove highlight', () => {
    const nodeA = createNode(
      getBlobComponent({ id: 'project', orgId: 'acme' })
    );
    const nodeB = createNode(
      getBlobComponent({ id: 'project', orgId: 'acme' })
    );
    const edge: ComputedEdge = {
      id: 'a->b',
      source: nodeA.id,
      target: nodeB.id,
      sourceHandle: 'sl',
      targetHandle: 'tr',
      data: {
        read: true,
        write: true,
      },
    };

    highlightNode(nodeB.id, [nodeA, nodeB], [edge]);
    highlightNode('foobar', [nodeA, nodeB], [edge]);
    expect(nodeA.className).toBe('');
    expect(nodeB.className).toBe('');
    expect(edge.className).toBe('');
  });
});
