import { hDef } from 'api/src/common/validators/flow.constants';
import type { ApiProject } from 'api/src/types/api';

export function computeProjectPosition(projects: ApiProject[]): {
  x: number;
  y: number;
} {
  // Compute global bounding box
  const global = { x: 0, y: 0, width: 0, height: 0 };
  for (const proj of Object.values(projects)) {
    global.x = Math.min(proj.display.pos.x, global.x);
    global.y = Math.min(proj.display.pos.y, global.y);
    global.width = Math.max(proj.display.size.width, global.width);
    global.height = Math.max(proj.display.size.height, global.height);
  }

  // Simply add on top of it
  return { x: global.x, y: global.y - (hDef + 10) };
}

export function computeWidth(name: string, min: number, max: number) {
  return Math.min(max, Math.max(min, name.length * 6 + 16 + 8)); // icon + gap
}
