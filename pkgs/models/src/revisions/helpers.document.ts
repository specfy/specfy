import path from 'node:path';

import { nanoid, slugify, titleCase } from '@specfy/core';
import type { Documents } from '@specfy/db';
import { defaultMarkdownParser } from 'prosemirror-markdown';

import type { BlockLevelZero, BlockText, Blocks } from '../documents';
import type { DBDocument } from '../documents/types.js';

import type {
  ApiBlobCreate,
  ApiBlobCreateDocument,
  PostUploadRevision,
} from './types.api.js';

const attrName = 'uid';
const allowListFilename: Record<string, string> = {
  'CHANGELOG.md': 'Changelog',
  'README.md': 'Readme',
};

export type ParsedUpload = { path: string; content: BlockLevelZero };

export function markdownToProseMirror(content: string): BlockLevelZero {
  const parse: BlockLevelZero = defaultMarkdownParser.parse(content)?.toJSON();
  parse.content.forEach(iterNode);

  return parse;
}

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

    const name = titleCase(getDocumentTitle(doc, prev));

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

const mapMarkType: Record<string, any> = {
  strong: 'bold',
  em: 'italic',
};

export function correctMark(node: BlockText) {
  if (!node.marks) {
    return;
  }

  for (const mark of node.marks) {
    if (mapMarkType[mark.type as string]) {
      mark.type = mapMarkType[mark.type];
    }
  }
}

/**
 * Iterate nodes recursively
 */
export function iterNode(node: Blocks) {
  if (node.type === 'hardBreak') {
    return;
  }
  if (node.type === 'text') {
    correctMark(node);
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
  const copy = [...blobs];

  // Build folder hierarchy
  const folders = new Map<
    string,
    PostUploadRevision['Body']['blobs'][0] | false
  >();
  for (const blob of blobs) {
    if (folders.has(blob.path)) {
      const defined = folders.get(blob.path);
      if (defined !== false) {
        throw new Error('Same path should not happen');
      }
      folders.set(blob.path, blob);
      continue;
    }

    // The specified path is already a folder (most probably)
    if (!blob.path.endsWith('.md')) {
      folders.set(blob.path, blob);
      continue;
    }

    const dir = path.dirname(blob.path);
    if (folders.has(dir)) {
      continue;
    }

    const paths = blob.path.split('/');
    let acc = '/';
    for (const tmp of paths) {
      if (!folders.has(acc)) {
        folders.set(acc, false);
      }
      acc = path.join(acc, tmp);
    }
  }

  // Create missing folder index
  for (const [key, folder] of folders) {
    if (folder) {
      continue;
    }

    const title = titleCase(path.basename(key));
    copy.push({
      path: key,
      content: `# ${title}`,
    });
  }

  // ---- Sort
  // We also sort:
  // 1. Because Prisma does not support Deferrable fk check  https://github.com/prisma/prisma/issues/8807
  // 2. And it creates better Revisions
  const sorted = copy.sort((a, b) => (a.path > b.path ? 1 : -1));

  // Remove empty root
  if (sorted.length > 0 && sorted[0].path === '/') {
    sorted.shift();
  }

  // ---- Transform content into a ProseMirror object
  const parsed: ParsedUpload[] = [];
  for (const blob of sorted) {
    parsed.push({
      path: blob.path,
      content: markdownToProseMirror(blob.content),
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
    doc.content.content[0].type === 'heading' &&
    doc.content.content[0].content
  ) {
    name = doc.content.content[0].content[0].text;
    doc.content.content.shift();
  }

  // // If there was a title we keep it because it might be have been overide manually
  // // It can be problematic when github is the source of truth and user change the title in the markdown but not the path, it won't be reflected.
  // if (prev) name = prev.name;
  const basename = path.basename(doc.path);
  if (basename in allowListFilename) {
    name = allowListFilename[basename];
  } else if (!name) {
    name = path.basename(doc.path).replace('.md', '');
  }

  return name;
}
