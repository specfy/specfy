import { nanoid } from '@specfy/api/src/common/id';
import {
  hDef,
  hDefHost,
  wDef,
  wDefHost,
} from '@specfy/api/src/common/validators/flow.constants';
import type { ApiComponent } from '@specfy/api/src/types/api';
import type { FlowEdge } from '@specfy/api/src/types/db';

import { getEmptyDoc } from './content';
import type { ComponentsState, ProjectState } from './store';

/**
 * Get all childs of a component.
 */
export function getAllChilds(
  components: ApiComponent[],
  id: string
): ApiComponent[] {
  const tmp = [];
  for (const component of components) {
    if (component.inComponent === id) {
      tmp.push(component);
      tmp.push(...getAllChilds(components, component.id));
    }
  }
  return tmp;
}

export function createLocal(
  data: Partial<Pick<ApiComponent, 'techId' | 'typeId'>> &
    Pick<ApiComponent, 'name' | 'slug' | 'type'>,
  storeProject: ProjectState,
  storeComponents: ComponentsState
) {
  const id = nanoid();

  const size =
    data.type === 'hosting'
      ? { width: wDefHost, height: hDefHost }
      : { width: wDef, height: hDef };

  // Compute global bounding box
  const global = { x: 0, y: 0, width: 0, height: 0 };
  for (const component of Object.values(storeComponents.components)) {
    global.x = Math.min(component.display.pos.x, global.x);
    global.y = Math.min(component.display.pos.y, global.y);
    global.width = Math.max(component.display.size.width, global.width);
    global.height = Math.max(component.display.size.height, global.height);
  }

  // Simply add on top of it
  const pos = { x: global.x, y: global.y - size.height };

  const add: ApiComponent = {
    id,
    orgId: storeProject.project!.id,
    projectId: storeProject.project!.id,
    techId: data.techId || null,
    type: data.type,
    typeId: data.typeId || null,
    name: data.name,
    slug: data.slug,
    description: getEmptyDoc(),
    techs: [],
    display: { pos: pos, size },
    edges: [],
    blobId: '',
    inComponent: null,
    show: true,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  storeComponents.create(add);
  return id;
}

/**
 * Position the edge on port from a to b.
 */
export function positionEdge(
  a: ApiComponent,
  b: ApiComponent
): { source: FlowEdge['portSource']; target: FlowEdge['portTarget'] } {
  const isCurrentAbove =
    a.display.pos.y + a.display.size.height < b.display.pos.y;
  const isCurrentBelow =
    a.display.pos.y > b.display.pos.y + b.display.size.height;
  const isCurrentRight =
    a.display.pos.x > b.display.pos.x + b.display.size.width;
  const isCurrentLeft = a.display.pos.x + a.display.pos.x < b.display.pos.x;

  let source: FlowEdge['portSource'] = 'left';
  let target: FlowEdge['portTarget'] = 'right';
  if (isCurrentLeft) {
    source = 'right';
    target = 'left';
  } else if (isCurrentAbove && !isCurrentRight) {
    source = 'bottom';
    target = 'top';
  } else if (isCurrentBelow) {
    source = 'top';
    target = 'bottom';
  }

  return { source, target };
}
