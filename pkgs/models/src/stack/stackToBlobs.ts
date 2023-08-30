import { slugify, pick } from '@specfy/core';
import type { Components } from '@specfy/db';
import type { AnalyserJson } from '@specfy/stack-analyser';
import { tech } from '@specfy/stack-analyser';

import type { ComponentType, DBComponent } from '../components/types.js';
import { getComponentSize } from '../flows/helpers.js';
import type {
  ApiBlobCreate,
  ApiBlobCreateComponent,
  PostUploadRevision,
} from '../revisions';
import { findPerfectMatch, findPrevious } from '../stack/index.js';

import { getTitle } from './helpers.js';
import type { StackToBlobs } from './types.js';

const changing: Array<keyof Components> = [
  'edges',
  'source',
  'sourceName',
  'sourcePath',
  'techId',
  'techs',
  'name',
  'inComponent',
];

/**
 * Prepare blobs to create, update or delete
 */
export function stackToBlobs(
  parsed: AnalyserJson,
  prevs: Components[],
  data: PostUploadRevision['Body']
): StackToBlobs {
  const now = new Date().toISOString();
  const unchanged: string[] = [];
  const source = data.source;

  // Find perfect matches first so we don't confuse them later in rename or mv
  const prevIdUsed: string[] = [];
  const perfectMatches = new Map<string, Components>();
  for (const child of parsed.childs) {
    const perfect = findPerfectMatch({ child, prevs, source });
    if (perfect) {
      prevIdUsed.push(perfect.id);
      perfectMatches.set(child.id, perfect);
    }
  }

  //
  const idsMap: Record<string, string> = {};
  const blobs: ApiBlobCreateComponent[] = [];
  for (const child of parsed.childs) {
    let prev: Components | null = null;
    if (perfectMatches.has(child.id)) {
      prev = perfectMatches.get(child.id)!;
    } else {
      prev = findPrevious({ child, prevs, source, prevIdUsed });
      if (prev) {
        prevIdUsed.push(prev.id);
      }
    }

    let current: DBComponent;
    if (prev) {
      current = {
        ...(prev as unknown as DBComponent),
        source,
        sourceName: child.name,
        sourcePath: child.path,
        techId: child.tech,
        techs: child.techs,
        inComponent: child.inComponent,
      };

      // Store changed ids
      idsMap[child.id] = current.id;
      idsMap[current.id] = current.id;
    } else {
      // TODO: try to place new components without overlapping and without auto layout
      const type: ComponentType = child.tech
        ? tech.indexed[child.tech].type
        : 'service';
      current = {
        id: child.id,
        blobId: null,
        orgId: data.orgId,
        projectId: data.projectId,
        name: child.name,
        slug: slugify(child.name),
        type: type,
        typeId: null,
        display: {
          zIndex: 1,
          pos: { x: 0, y: 0 },
          size: getComponentSize(type, child.name),
        },
        edges: child.edges.map((edge) => {
          return {
            ...edge,
            portSource: 'sr',
            portTarget: 'tl',
            vertices: [],
          };
        }),
        inComponent: child.inComponent,
        description: { type: 'doc', content: [] },
        source: data.source,
        sourceName: child.name,
        sourcePath: child.path,
        techId: child.tech,
        techs: child.techs,
        tags: ['github'],
        show: true,
        createdAt: now,
        updatedAt: now,
      };
      idsMap[current.id] = child.id;
    }

    current.name = getTitle(current.name);

    blobs.push({
      created: !prev,
      deleted: false,
      parentId: prev ? prev.blobId : null,
      type: 'component',
      typeId: current.id,
      current,
    });
  }

  const deleted: ApiBlobCreate[] = prevs
    .filter((p) => {
      return !prevIdUsed.includes(p.id) && p.source === source;
    })
    .map((prev) => {
      return {
        created: false,
        deleted: true,
        parentId: prev.blobId,
        type: 'component',
        typeId: prev.id,
        current: prev as any,
      };
    });

  // ---- Apply post compilation change (e.g: deleted hosts, deleted edges, etc.)
  blobs.forEach((blob) => {
    if (blob.deleted) {
      return;
    }

    if (blob.current.inComponent) {
      if (idsMap[blob.current.inComponent] === undefined) {
        // Host was deleted
        blob.current.inComponent = null;
      } else {
        blob.current.inComponent = idsMap[blob.current.inComponent];
      }
    }

    const newEdges = [];
    for (const edge of blob.current.edges) {
      if (idsMap[edge.target] === undefined) {
        // edge and component was deleted
        continue;
      }
      edge.target = idsMap[edge.target];
      newEdges.push(edge);
    }
    blob.current.edges = newEdges;
  });

  // Detect unchanged blobs
  for (const blob of blobs) {
    if (blob.created) {
      continue;
    }

    const prev = prevs.find((p) => p.id === blob.typeId)!;
    if (
      JSON.stringify(pick(prev, changing)) ===
      JSON.stringify(pick(blob.current, changing))
    ) {
      unchanged.push(prev.id);
    }
  }

  // Fail safe
  if (
    blobs.length + deleted.length + unchanged.length >
    prevs.length + parsed.childs.length
  ) {
    throw new Error('More output than input');
  }

  return { blobs, deleted, unchanged };
}
