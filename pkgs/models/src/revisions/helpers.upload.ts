import path from 'node:path';

import { nanoid, titleCase } from '@specfy/core';
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

/**
 * Prepare blobs to create, update or delete
 */
export function uploadedDocumentsToDB(
  parsed: ParsedUpload[],
  prevs: Documents[],
  data: Pick<PostUploadRevision['Body'], 'orgId' | 'source' | 'projectId'>
): { deleted: ApiBlobCreate[]; blobs: ApiBlobCreateDocument[] } {
  const now = new Date().toISOString();

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

  return { deleted, blobs };
}
