import { slugify, pick, isDiffObjSimple } from '@specfy/core';
import type { Components } from '@specfy/db';
import type { AnalyserJson } from '@specfy/stack-analyser';
import { tech as techList } from '@specfy/stack-analyser';

import type { ComponentType, DBComponent } from '../components/types.js';
import { getComponentSize } from '../flows/helpers.js';
import type { FlowEdge } from '../flows/types.js';
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

  // new/old -> new
  const idsMap: Record<string, string> = {};
  // new -> old
  const idsMapReverse: Record<string, string> = {};
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
        techs: mergeTechs({ prev: prev.techs, next: child.techs, source }),
      };
      if (prev.inComponent.source === source) {
        current.inComponent = { id: child.inComponent, source };
      }

      // Store changed ids
      idsMapReverse[current.id] = child.id;
      idsMap[child.id] = current.id;
      idsMap[current.id] = current.id;
    } else {
      // TODO: try to place new components without overlapping and without auto layout
      const type: ComponentType = child.tech
        ? techList.indexed[child.tech].type
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
            source,
          };
        }),
        inComponent: { id: child.inComponent, source },
        description: { type: 'doc', content: [] },
        source: data.source,
        sourceName: child.name,
        sourcePath: child.path,
        techId: child.tech,
        techs: child.techs.map((id) => {
          return { id, source };
        }),
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

    if (
      blob.current.inComponent.id &&
      blob.current.inComponent.source === source
    ) {
      if (idsMap[blob.current.inComponent.id] === undefined) {
        // Host was deleted
        blob.current.inComponent = { id: null, source };
      } else {
        blob.current.inComponent = {
          id: idsMap[blob.current.inComponent.id],
          source,
        };
      }
    }

    if (!blob.created) {
      const next = parsed.childs.find(
        (child) => child.id === idsMapReverse[blob.typeId]
      )!.edges;
      blob.current.edges = mergeEdges({
        prev: blob.current.edges,
        next,
        source,
        idsMap,
      });
    } else {
      blob.current.edges = mergeEdges({
        prev: [],
        next: blob.current.edges,
        source,
        idsMap,
      });
    }
  });

  // Detect unchanged blobs
  const stats = { created: 0, modified: 0, deleted: 0, unchanged: 0 };
  stats.deleted = deleted.length;
  for (const blob of blobs) {
    if (blob.created) {
      stats.created += 1;
      continue;
    }

    const prev = prevs.find((p) => p.id === blob.typeId)!;
    if (isDiffObjSimple(pick(prev, changing), pick(blob.current, changing))) {
      unchanged.push(prev.id);
      stats.unchanged += 1;
    } else {
      stats.modified += 1;
    }
  }

  // Fail safe
  if (
    blobs.length + deleted.length + unchanged.length >
    prevs.length + parsed.childs.length
  ) {
    throw new Error('More output than input');
  }

  return { blobs, deleted, unchanged, stats };
}

/**
 * Merge techs
 */

function mergeTechs({
  prev,
  next,
  source,
}: {
  prev: Components['techs'];
  next: AnalyserJson['techs'];
  source: string;
}): DBComponent['techs'] {
  if (prev.length <= 0) {
    return next.map((id) => ({ id, source }));
  }

  const techs: DBComponent['techs'] = [];
  for (const tech of prev) {
    if (tech.source !== source) {
      // It's not the same source
      techs.push(tech);
      continue;
    }

    const exist = next.find((id) => id === tech.id);
    if (!exist) {
      // Deleted on the repo
      continue;
    }

    // Found before and after
    techs.push(tech);
  }

  // Find new edges
  for (const tech of next) {
    const exist = prev.find((v) => v.id === tech);
    if (exist) {
      // Already handled before
      continue;
    }

    techs.push({
      id: tech,
      source,
    });
  }

  return techs;
}

/**
 * Merge edges from prev to next
 */
function mergeEdges({
  prev,
  next,
  source,
  idsMap,
}: {
  prev: FlowEdge[];
  next: AnalyserJson['edges'];
  source: string;
  idsMap: Record<string, string>;
}): FlowEdge[] {
  const edges: FlowEdge[] = [];

  // Find old edges and deleted edges
  for (const edge of prev) {
    if (edge.source !== source) {
      // It's not the same source
      // even if it could be the same exact edge, the user put it there so leave them the ownership
      edges.push(edge);
      continue;
    }

    const exist = next.find((v) => idsMap[v.target] === edge.target);
    if (!exist) {
      // Deleted on the repo
      continue;
    }

    // Found before and after
    // NB: We don't update the read/write prop
    edges.push(edge);
  }

  // Find new edges
  for (const edge of next) {
    const exist = prev.find((v) => v.target === idsMap[edge.target]);
    if (exist) {
      // Already handled before
      continue;
    }

    edges.push({
      ...edge,
      target: idsMap[edge.target],
      portSource: 'sr',
      portTarget: 'tl',
      vertices: [],
      source,
    });
  }

  return edges;
}
