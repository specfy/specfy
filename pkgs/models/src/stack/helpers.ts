import { titleCase } from '@specfy/core';

import { componentsToFlow, computeLayout } from '../flows';

import type { StackToBlobs } from './types.js';

const scoped = /^@[a-zA-Z0-9_-]+\/.*$/;

export function getTitle(title: string): string {
  let name = title;
  if (scoped.test(name)) {
    name = name.split('/')[1];
  }

  return titleCase(name.replaceAll('-', ' '));
}

export function autoLayout(stack: StackToBlobs) {
  const nodes = stack.blobs.map((b) => b.current);
  const layout = computeLayout(componentsToFlow(nodes));

  for (const node of nodes) {
    const rel = layout.nodes.find((l) => l.id === node.id)!;
    node.display.pos = rel.pos;
    node.display.size = rel.size;
  }
}
