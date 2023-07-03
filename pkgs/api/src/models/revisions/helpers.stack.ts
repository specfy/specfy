import type { Components } from '@prisma/client';
import type { AnalyserJson } from '@specfy/stack-analyser';
import { tech } from '@specfy/stack-analyser';

import { computeLayout } from '../../common/flow/layout.js';
import { componentsToFlow } from '../../common/flow/transform.js';
import { getComponentSize } from '../../common/flow.js';
import { pick } from '../../common/object.js';
import { slugify, titleCase } from '../../common/string.js';
import type {
  ApiBlobCreate,
  ApiBlobCreateComponent,
  PostUploadRevision,
} from '../../types/api/index.js';
import type { ComponentType, DBComponent } from '../../types/db/components.js';

const changing: Array<keyof Components> = [
  'edges',
  'source',
  'sourceName',
  'sourcePath',
  'techId',
  'techs',
  'name',
];

export interface StackToDB {
  deleted: ApiBlobCreate[];
  blobs: ApiBlobCreateComponent[];
  unchanged: string[];
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
    const prev = prevs.find((p) => {
      return (
        p.sourceName === child.name &&
        p.techId === child.tech &&
        p.source === data.source
      );
    });

    let current: DBComponent;
    if (prev) {
      current = {
        ...(prev as unknown as DBComponent),
        source: data.source,
        sourceName: child.name,
        sourcePath: child.path,
        techId: child.tech,
        techs: child.techs,
      };

      // Store changed ids
      idsMap[child.id] = current.id;
      idsMap[current.id] = current.id;
    } else {
      // TODO: try to place new components without overlapping and without autolayout
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
            portSource: 'right',
            portTarget: 'left',
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

  // TODO: potential error with component with the same name ?
  const deleted: ApiBlobCreate[] = prevs
    .filter((p) => {
      return !parsed.childs.find(
        (child) => child.name === p.sourceName && child.tech === p.techId
      );
    })
    .map((prev) => {
      return {
        created: false,
        deleted: true,
        parentId: prev.blobId,
        type: 'component',
        typeId: prev.id,
        current: undefined as unknown as null,
      };
    });

  // ---- Find ids that has changed
  blobs.forEach((blob) => {
    if (!blob.current) {
      return;
    }

    if (blob.current.inComponent) {
      if (idsMap[blob.current.inComponent] === undefined) {
        throw new Error('Component host does not exists anymore');
      }
      blob.current.inComponent = idsMap[blob.current.inComponent];
    }

    blob.current.edges.forEach((edge) => {
      if (idsMap[edge.target] === undefined) {
        throw new Error('Edge does not exists anymore');
      }
      edge.target = idsMap[edge.target];
    });
  });

  // Detect unchanged blobs
  for (const blob of blobs) {
    if (blob.created) {
      continue;
    }

    const prev = prevs.find((p) => p.id === blob.typeId)!;
    if (
      JSON.stringify(pick(prev, changing)) ===
      JSON.stringify(pick(blob.current!, changing))
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
  const nodes = stack.blobs.map((b) => b.current!);
  const layout = computeLayout(componentsToFlow(nodes));

  for (const node of nodes) {
    const rel = layout.nodes.find((l) => l.id === node.id)!;
    node.display.pos = rel.pos;
    node.display.size = rel.size;
  }
}
