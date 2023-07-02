import { describe, expect, it } from 'vitest';

import { computeLayout, computeTree } from './layout.js';
import { createNode } from './transform.js';
import type { ComponentForFlow } from './types.js';

function getComp(id: string, host: string | null = null): ComponentForFlow {
  return {
    id,
    edges: [],
    inComponent: host,
    type: 'service',
    name: id,
    techId: null,
    display: { pos: { x: 0, y: 0 }, size: { width: 100, height: 20 } },
  };
}

function getHost(id: string, host: string | null = null): ComponentForFlow {
  return {
    ...getComp(id, host),
    type: 'hosting',
  };
}

describe('layout', () => {
  it('should output vertically when no host', () => {
    const layout = computeLayout({
      edges: [],
      nodes: [
        createNode(getComp('a')),
        createNode(getComp('b')),
        createNode(getComp('c')),
      ],
    });

    expect(layout).toStrictEqual({
      height: 140,
      width: 140,
      x: 0,
      y: 0,
      nodes: [
        {
          id: 'a',
          pos: { x: 20, y: 20 },
          size: { width: 100, height: 20 },
        },
        {
          id: 'b',
          pos: { x: 20, y: 60 },
          size: { width: 100, height: 20 },
        },
        {
          id: 'c',
          pos: { x: 20, y: 100 },
          size: { width: 100, height: 20 },
        },
      ],
    });
  });

  it('should compute a tree', () => {
    const tree = computeTree([
      createNode(getHost('a')),
      createNode(getHost('b', 'a')),
      createNode(getHost('c', 'b')),
      createNode(getComp('d', 'c')),
      createNode(getComp('e', 'a')),
      createNode(getComp('f')),
    ]);

    expect(tree).toStrictEqual([
      {
        id: 'a',
        childs: [
          {
            id: 'b',
            childs: [
              {
                id: 'c',
                childs: [
                  {
                    id: 'd',
                    parentId: 'c',
                    childs: [],
                  },
                ],
                parentId: 'b',
              },
            ],
            parentId: 'a',
          },
          {
            id: 'e',
            parentId: 'a',
            childs: [],
          },
        ],
        parentId: null,
      },
      {
        id: 'f',
        parentId: null,
        childs: [],
      },
    ]);
  });

  it('should put host inside host', () => {
    const layout = computeLayout({
      edges: [],
      nodes: [createNode(getHost('a')), createNode(getHost('b', 'a'))],
    });

    expect(layout).toStrictEqual({
      height: 100,
      width: 180,
      x: 0,
      y: 0,
      nodes: [
        {
          id: 'b',
          pos: { x: 20, y: 20 },
          size: { width: 100, height: 20 },
        },
        {
          id: 'a',
          pos: { x: 20, y: 20 },
          size: { width: 140, height: 60 },
        },
      ],
    });
  });

  it('should put component inside host', () => {
    const layout = computeLayout({
      edges: [],
      nodes: [
        createNode(getHost('a')),
        createNode(getHost('b', 'a')),
        createNode(getComp('c', 'b')),
        createNode(getComp('d', 'a')),
        createNode(getComp('f')),
      ],
    });

    const snap = [
      {
        id: 'c',
        pos: { x: 20, y: 20 },
        size: { width: 100, height: 20 },
      },
      {
        id: 'b',
        pos: { x: 20, y: 20 },
        size: { width: 140, height: 60 },
      },
      {
        id: 'd',
        pos: { x: 20, y: 100 },
        size: { width: 100, height: 20 },
      },
      {
        id: 'a',
        pos: { x: 20, y: 20 },
        size: { width: 180, height: 140 },
      },
      {
        id: 'f',
        pos: { x: 20, y: 180 },
        size: { width: 100, height: 20 },
      },
    ];
    expect(layout.nodes).toEqual(snap);
    expect(layout).toEqual({
      x: 0,
      y: 0,
      width: 220,
      height: 220,
      nodes: snap,
    });
  });
});
