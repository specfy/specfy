import { slugify, titleCase, pick } from '@specfy/core';
import type { Components } from '@specfy/db';
import type { AnalyserJson } from '@specfy/stack-analyser';
import { tech } from '@specfy/stack-analyser';

import type { ComponentType, DBComponent } from '../components/types.js';
import { getComponentSize } from '../flows/helpers.js';
import { computeLayout } from '../flows/layout.js';
import { componentsToFlow } from '../flows/transform.js';

import type {
  ApiBlobCreate,
  ApiBlobCreateComponent,
  PostUploadRevision,
} from './types.api.js';

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

export interface StackToDB {
  deleted: ApiBlobCreate[];
  blobs: ApiBlobCreateComponent[];
  unchanged: string[];
}

/**
 * When we receive a stack Payload, each component have id, name, tech and sourcePath
 * that we can use to differentiate and potentially find the component already in DB that matches.
 * In most case the naive triple check is enough. But in some cases sourcePath check is mandatory.
 * e.g:
 *  two components named API with tech null in a different place
 *
 * - We can't use a perfect hash because any sourcePath change would break the mv scenario.
 * - The rename scenario is the most probable however it's very hard to differentiate a rename from a delete + new
 *
 * So right now if we have an API component that is renamed Api and no tech or sourcePath changes, it will be recreated until better algo.
 */
export function findPrev(
  child: AnalyserJson,
  prevs: Components[],
  source: string
) {
  const matches = [];
  // Naive match that should fit 99% use case
  // We don't check the path yet because it can be a mv case if there is only one match
  for (const prev of prevs) {
    if (
      prev.sourceName === child.name &&
      prev.techId === child.tech &&
      prev.source === source
    ) {
      matches.push(prev);
    }
  }

  if (matches.length <= 1) {
    return matches[0];
  }

  // Second step, multiple components match.
  // We need to adapt the heuristic and check old path
  // If nothing match perfectly it's going to be recreated
  // But we don't want to pick the wrong one
  for (const match of matches) {
    if (!match.sourcePath) {
      // This would be weird but TS pleasing
      continue;
    }

    for (const path of match.sourcePath) {
      if (child.path.includes(path)) {
        // We matched a path, there is 99.99% chance we found the right one
        // There is still a chance multiple would have match
        // but at this point it's either an acceptable edge case or someone crafting a payload
        return match;
      }
    }
  }

  return null;
}

/**
 * Prepare blobs to create, update or delete
 */
export function uploadedStackToDB(
  parsed: AnalyserJson,
  prevs: Components[],
  data: PostUploadRevision['Body']
): StackToDB {
  const now = new Date().toISOString();
  const unchanged: string[] = [];

  const idsMap: Record<string, string> = {};
  const blobs: ApiBlobCreateComponent[] = parsed.childs.map((child) => {
    const prev = findPrev(child, prevs, data.source);

    let current: DBComponent;
    if (prev) {
      current = {
        ...(prev as unknown as DBComponent),
        source: data.source,
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

    return {
      created: !prev,
      deleted: false,
      parentId: prev ? prev.blobId : null,
      type: 'component',
      typeId: current.id,
      current,
    };
  });

  const deleted: ApiBlobCreate[] = prevs
    .filter((p) => {
      if (p.source !== data.source) {
        return false;
      }
      return !parsed.childs.find(
        (child) =>
          child.name === p.sourceName &&
          ((child.tech !== null && child.tech === p.techId) ||
            (child.tech === null && p.techId === null))
      );
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

  // ---- Find ids that has changed
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

  return { blobs, deleted, unchanged };
}

const scoped = /^@[a-zA-Z0-9_-]+\/.*$/;
function getTitle(title: string): string {
  let name = title;
  if (scoped.test(name)) {
    name = name.split('/')[1];
  }

  return titleCase(name.replaceAll('-', ' '));
}

export function autoLayout(stack: StackToDB) {
  const nodes = stack.blobs.map((b) => b.current);
  const layout = computeLayout(componentsToFlow(nodes));

  for (const node of nodes) {
    const rel = layout.nodes.find((l) => l.id === node.id)!;
    node.display.pos = rel.pos;
    node.display.size = rel.size;
  }
}
