import path from 'node:path';

import { isDiffObjSimple, nanoid, pick, titleCase } from '@specfy/core';
import type { Documents } from '@specfy/db';

import type { DBDocument } from '../documents/types.js';
import {
  getDocumentTitle,
  mdExtension,
  type ParsedUpload,
} from '../prosemirror/index.js';

import type {
  ApiBlobCreate,
  ApiBlobCreateDocument,
  PostUploadRevision,
} from './types.api.js';

const changing: Array<keyof Documents> = [
  'slug',
  'format',
  'hash',
  'sourcePath',
];

export interface DocsToBlobs {
  deleted: ApiBlobCreate[];
  blobs: ApiBlobCreateDocument[];
  unchanged: string[];
  stats: {
    created: number;
    modified: number;
    deleted: number;
    unchanged: number;
  };
}

/**
 * Prepare blobs to create, update or delete
 */
export function uploadedDocumentsToDB(
  parsed: ParsedUpload[],
  prevs: Documents[],
  data: Pick<PostUploadRevision['Body'], 'orgId' | 'source' | 'projectId'>
): DocsToBlobs {
  const now = new Date().toISOString();
  const unchanged: string[] = [];

  // ---- Find new or updated blobs
  const blobs: ApiBlobCreateDocument[] = parsed.map((doc) => {
    const prev = prevs.find((p) => p.sourcePath === doc.path);

    const name = titleCase(getDocumentTitle(doc, prev));
    const slug = doc.path.substring(1).replace(mdExtension, '');

    const current: DBDocument = prev
      ? {
          ...(prev as unknown as DBDocument),
          name,
          slug: slug,
          format: 'pm',
          hash: doc.hash,
          content: JSON.stringify(doc.content),
          source: data.source,
          sourcePath: doc.path,
        }
      : {
          id: nanoid(),
          blobId: null,
          format: 'pm',
          hash: doc.hash,
          content: JSON.stringify(doc.content),
          locked: false,
          name,
          orgId: data.orgId,
          projectId: data.projectId,
          parentId: null,
          source: data.source,
          sourcePath: doc.path,
          slug: slug,
          tldr: '',
          type: 'doc',
          typeId: null,
          createdAt: now,
          updatedAt: now,
        };
    return {
      created: !prev,
      deleted: false,
      parentId: prev ? prev.blobId : null,
      type: 'document',
      typeId: current.id,
      current,
    };
  });

  // ---- Find blobs parents to construct hierarchy
  blobs.forEach((blob) => {
    const folder = path.join(path.dirname(blob.current.sourcePath!));
    const parent = blobs.find(
      (b) => b.current.sourcePath === folder && b.typeId !== blob.typeId
    );
    if (!parent) {
      return;
    }

    blob.current.parentId = parent.current.id;
  });

  // ---- Find Deleted blobs
  const deleted: ApiBlobCreate[] = prevs
    .filter((p) => !parsed.find((d) => d.path === p.sourcePath))
    .map((prev) => {
      return {
        created: false,
        deleted: true,
        parentId: prev.blobId,
        type: 'document',
        typeId: prev.id,
        current: prev as any,
      };
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
      stats.modified += 1;
    } else {
      stats.unchanged += 1;
      unchanged.push(prev.id);
    }
  }

  return { blobs, deleted, unchanged, stats };
}
