import { nanoid } from '@specfy/core/src/id';
import {
  hDef,
  hDefHost,
  wDef,
  wDefHost,
} from '@specfy/models/src/flows/constants';

import type { FlowEdge, ApiComponent } from '@specfy/models';

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
    if (component.inComponent.id === id) {
      tmp.push(component);
      tmp.push(...getAllChilds(components, component.id));
    }
  }
  return tmp;
}

export function createLocal(
  data: Partial<Pick<ApiComponent, 'techId' | 'typeId'>> &
    Pick<ApiComponent, 'name' | 'slug' | 'type'> & {
      position?: { x: number; y: number };
    },
  storeProject: ProjectState,
  storeComponents: ComponentsState
) {
  const id = nanoid();

  const size =
    data.type === 'hosting'
      ? { width: wDefHost, height: hDefHost }
      : { width: wDef, height: hDef };

  let pos = { x: 0, y: 0 };

  // Compute global bounding box
  if (data.position) {
    pos = data.position;
  } else {
    const global = { x: 0, y: 0, width: 0, height: 0 };
    for (const component of Object.values(storeComponents.components)) {
      global.x = Math.min(component.display.pos.x, global.x);
      global.y = Math.min(component.display.pos.y, global.y);
      global.width = Math.max(component.display.size.width, global.width);
      global.height = Math.max(component.display.size.height, global.height);
    }

    // Simply add on top of it
    pos = { x: global.x, y: global.y - size.height };
  }

  const add: ApiComponent = {
    id,
    orgId: storeProject.project!.orgId,
    projectId: storeProject.project!.id,
    techId: data.techId || null,
    type: data.type,
    typeId: data.typeId || null,
    name: data.name,
    slug: data.slug,
    description: getEmptyDoc(),
    techs: [],
    display: { pos, size },
    edges: [],
    blobId: null,
    inComponent: { id: null },
    show: true,
    tags: [],
    source: null,
    sourceName: null,
    sourcePath: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  storeComponents.create(add);
  return add;
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

  let source: FlowEdge['portSource'] = 'sl';
  let target: FlowEdge['portTarget'] = 'tr';
  if (isCurrentLeft) {
    source = 'sr';
    target = 'tl';
  } else if (isCurrentAbove && !isCurrentRight) {
    source = 'sb';
    target = 'tt';
  } else if (isCurrentBelow) {
    source = 'st';
    target = 'tb';
  }

  return { source, target };
}
