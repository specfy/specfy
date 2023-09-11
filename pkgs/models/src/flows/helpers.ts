import type { ApiComponent } from '../components';

import { hDef, hDefHost, wDef, wDefHost, wMax } from './constants.js';
import type { ComputedFlow } from './types.js';

// Compute global bounding box
// Do not cache unless you don't plan to add things to the Flow
export function getFlowBoundingBox(flow: ComputedFlow): {
  x: number;
  y: number;
} {
  const global = { x: 0, y: 0 };
  for (const node of flow.nodes) {
    global.x = Math.min(node.position.x, global.x);
    global.y = Math.min(node.position.y, global.y);
  }

  return global;
}

export function computeNewProjectPosition(flow: ComputedFlow): {
  x: number;
  y: number;
} {
  // Compute global bounding box
  // Needs to be called here because if we add multiple components the bounding box will change
  const global = getFlowBoundingBox(flow);

  // Simply add on top of it
  return { x: global.x, y: global.y - (hDef + 10) };
}

const iconSize = 22;
const padding = 12 * 2 + 6 * 2; // Outer + Inner
const gap = 2;
const char = 7.5;
export function computeWidth(name: string, min: number, max: number) {
  return Math.min(
    max,
    Math.max(min, name.length * char + padding + iconSize + gap)
  ); // icon + gap + padding
}

export function getComponentSize(
  type: ApiComponent['type'],
  name: ApiComponent['name']
): ApiComponent['display']['size'] {
  return {
    height: type === 'hosting' ? hDefHost : hDef,
    width:
      type === 'hosting'
        ? computeWidth(name, wDefHost, wMax)
        : computeWidth(name, wDef, wMax),
  };
}
