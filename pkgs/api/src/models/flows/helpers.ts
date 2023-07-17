import type { ApiComponent } from '../../types/api/index.js';

import { hDef, hDefHost, wDef, wDefHost, wMax } from './constants.js';
import type { ComputedFlow } from './types.js';

export function computeNewProjectPosition(flow: ComputedFlow): {
  x: number;
  y: number;
} {
  // Compute global bounding box
  const global = { x: 0, y: 0 };
  for (const node of flow.nodes) {
    global.x = Math.min(node.position.x, global.x);
    global.y = Math.min(node.position.y, global.y);
  }

  // Simply add on top of it
  return { x: global.x, y: global.y - (hDef + 10) };
}

const iconSize = 21;
const padding = 6 * 2;
const gap = 2;
const char = 6;
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
