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
    typeId: null,
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
  it('should output 3 components', () => {
    const layout = computeLayout({
      edges: [],
      nodes: [
        createNode(getComp('a')),
        createNode(getComp('b')),
        createNode(getComp('c')),
      ],
    });

    /**
     *      **A**   **B**
     *      **C**
     */
    expect(layout).toMatchSnapshot();
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

    expect(tree).toMatchSnapshot();
  });

  it('should compute a layout', () => {
    const layout = computeLayout({
      edges: [],
      nodes: [
        createNode(getHost('a')),
        createNode(getHost('b', 'a')),
        createNode(getHost('c', 'b')),
        createNode(getComp('d', 'c')),
        createNode(getComp('e', 'a')),
        createNode(getComp('f')),
      ],
    });

    /**
         +-----------------------------------------+
         |                                       A |   -----------
         | +-----------------------+   -------     |   f
         | |                     B |   e           |
         | |  +---------------+    |               |
         | |  | ------      C |    |               |
         | |  | d             |    |               |
         | |  +---------------+    |               |
         | |                       |               |
         | +-----------------------+               |
         +-----------------------------------------+
     */
    expect(layout).toMatchSnapshot();
  });

  it('should put 4 hosts in columns', () => {
    const layout = computeLayout({
      edges: [],
      nodes: [
        createNode(getHost('a')),
        createNode(getHost('b')),
        createNode(getHost('c')),
        createNode(getHost('d')),
      ],
    });

    /**
          +----------+   +----------+
          |A         |   |B         |
          +----------+   +----------+

          +----------+   +----------+
          |C         |   |D         |
          +----------+   +----------+
     */
    expect(layout).toMatchSnapshot();
  });

  it('should put components in columns', () => {
    const layout = computeLayout({
      edges: [],
      nodes: [
        createNode(getComp('a')),
        createNode(getComp('b')),
        createNode(getComp('c')),
        createNode(getComp('d')),
        createNode(getComp('e')),
      ],
    });

    /**
           +----------+   +----------+
           |    A     |   |    B     |
           +----------+   +----------+
           +----------+   +----------+
           |    C     |   |    D     |
           +----------+   +----------+
           +----------+
           |    E     |
           +----------+
     */
    expect(layout).toMatchSnapshot();
  });

  it('should put host inside host', () => {
    const layout = computeLayout({
      edges: [],
      nodes: [createNode(getHost('a')), createNode(getHost('b', 'a'))],
    });

    expect(layout).toMatchSnapshot();
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

    expect(layout).toMatchSnapshot();
  });
});
