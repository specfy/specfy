import path from 'node:path';

import type { Documents } from '@prisma/client';
import { defaultMarkdownParser } from 'prosemirror-markdown';

import { nanoid } from '../../common/id.js';
import { slugify } from '../../common/string.js';
import type {
  ApiBlobCreate,
  ApiBlobCreateDocument,
  BlockLevelZero,
  Blocks,
  PostUploadRevision,
} from '../../types/api/index.js';
import type { DBDocument } from '../../types/db/documents.js';

const attrName = 'uid';
const allowListFilename: Record<string, string> = {
  'CHANGELOG.md': 'Changelog',
  'README.md': 'Readme',
};

export type ParsedUpload = { path: string; content: BlockLevelZero };

/**
 * Prepare blobs to create, update or delete
 */
export function uploadedDocumentsToDB(
  parsed: ParsedUpload[],
  prevs: Documents[],
  data: PostUploadRevision['Body']
): { deleted: ApiBlobCreate[]; blobs: ApiBlobCreateDocument[] } {
  const now = new Date().toISOString();

  // ---- Find new or updated blobs
  const blobs: ApiBlobCreateDocument[] = parsed.map((doc) => {
    const prev = prevs.find((p) => p.sourcePath === doc.path);

    const name = getDocumentTitle(doc, prev);

    const current: DBDocument = prev
      ? {
          ...(prev as unknown as DBDocument),
          name,
          slug: slugify(name),
          content: doc.content,
          source: data.source,
          sourcePath: doc.path,
        }
      : {
          id: nanoid(),
          blobId: null,
          content: doc.content,
          locked: false,
          name,
          orgId: data.orgId,
          projectId: data.projectId,
          parentId: null,
          source: data.source,
          sourcePath: doc.path,
          slug: slugify(name),
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
    const folder = path.join(path.dirname(blob.current!.sourcePath!), '/');
    const parent = blobs.find(
      (b) => b.current!.sourcePath === folder && b.typeId !== blob.typeId
    );
    if (!parent) {
      return;
    }

    blob.current!.parentId = parent!.current!.id;
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
        current: undefined as unknown as null,
      };
    });

  return { deleted, blobs };
}

/**
 * The markdown parser is compatible with prosemirror but tiptap is using different extension names
 */
export function correctNode(node: any) {
  if (node.type === 'bullet_list') {
    node.type = 'bulletList';
  } else if (node.type === 'code_block') {
    node.type = 'codeBlock';
    node.attrs.language = node.attrs.params || 'sh';
  } else if (node.type === 'list_item') {
    node.type = 'listItem';
  } else if (node.type === 'horizontal_rule') {
    node.type = 'horizontalRule';
  } else if (node.type === 'ordered_list') {
    node.type = 'orderedList';
  } else if (node.type === 'hard_break') {
    node.type = 'hardBreak';
  } else if (node.type.includes('_')) {
    throw new Error(`unsupported block, ${node.type}`);
  }
}

/**
 * Iterate nodes recursively
 */
export function iterNode(node: Blocks) {
  if (node.type === 'text' || node.type === 'hardBreak') {
    return;
  }

  correctNode(node);

  if (!node.attrs) {
    node.attrs = {} as any;
  }
  node.attrs[attrName] = nanoid();
  if ('content' in node && node.content) {
    node.content.forEach(iterNode);
  }
}

/**
 * Transform raw upload (markdown) to proper Documents
 * It will also create a proper hierarchy of documents if the path are nested.
 */
export function uploadToDocuments(
  blobs: PostUploadRevision['Body']['blobs']
): ParsedUpload[] {
  // ---- Check if every path has a parent folder
  const checkedFolder = new Set<string>('/');
  const copy = [...blobs];
  const checked: Array<
    PostUploadRevision['Body']['blobs'][0] & { folder: string }
  > = [];
  while (copy.length > 0) {
    const blob = copy.shift()!;
    if (typeof blob === 'undefined') {
      continue;
    }

    // The specified path is already a folder
    if (blob.path.endsWith('/')) {
      checked.push({ ...blob, folder: blob.path });
      checkedFolder.add(blob.path);

      continue;
    }

    // The folder has already been checked
    const folder = path.join(path.dirname(blob.path), '/');
    if (checkedFolder.has(folder)) {
      checked.push({ ...blob, folder });

      continue;
    }

    // Exact match, unlikely with regular file upload but since it's an API it can be manually setup
    const parent = copy.findIndex((b) => b && b.path === folder);
    if (parent > -1) {
      checked.push({ ...copy[parent], folder });
      checked.push({ ...blob, folder });
      checkedFolder.add(folder);
      delete copy[parent];

      continue;
    }

    // There is an index.md which is good enough source
    const index = path.join(folder, 'index.md');
    const dup = copy.findIndex((b) => b && b.path.toLowerCase() === index);
    if (dup > -1) {
      checked.push({ ...copy[dup], path: folder, folder });
      checked.push({ ...blob, folder });
      checkedFolder.add(folder);
      delete copy[dup];

      continue;
    }

    // No match, we create an empty folder
    checked.push({ content: '', path: folder, folder });
    checked.push({ ...blob, folder });
    checkedFolder.add(folder);
  }

  // ---- Sort
  // We also sort:
  // 1. Because Prisma does not support Deferrable fk check  https://github.com/prisma/prisma/issues/8807
  // 2. And it creates better Revisions
  const sorted = checked.sort((a, b) => (a.path > b.path ? 1 : -1));

  // ---- Transform content into a ProseMirror object
  const parsed: ParsedUpload[] = [];
  for (const blob of sorted) {
    const parse: BlockLevelZero = defaultMarkdownParser
      .parse(blob.content)
      ?.toJSON();
    parse.content.forEach(iterNode);

    parsed.push({
      path: blob.path,
      content: parse,
    });
  }

  return parsed;
}

/**
 * Determines the best title of a document,
 * since filenames are usually not as good a the main H1 of a document except for a few exceptions.
 */
export function getDocumentTitle(doc: ParsedUpload, _prev?: Documents): string {
  let name;

  // Remove the title in document since we will display it independently
  if (
    doc.content.content.length > 0 &&
    doc.content.content[0].type === 'heading'
  ) {
    name = doc.content.content[0].content[0].text;
    doc.content.content.shift();
  }

  // // If there was a title we keep it because it might be have been overide manually
  // // It can be problematic when github is the source of truth and user change the title in the markdown but not the path, it won't be reflected.
  // if (prev) name = prev.name;
  const basename = path.basename(doc.path);
  if (basename in allowListFilename) name = allowListFilename[basename];
  else if (!name) name = path.basename(doc.path).replace('.md', '');

  return name;
}
