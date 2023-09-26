import path from 'node:path';

import { nanoid, titleCase } from '@specfy/core';
import { defaultMarkdownParser } from 'prosemirror-markdown';

import type { Projects } from '@specfy/db';

import {
  hashDocument,
  type BlockLevelZero,
  type BlockText,
  type Blocks,
} from '../documents/index.js';

import {
  attrName,
  isLinkAbsolute,
  mapMarkType,
  mdExtension,
} from './constants.js';

import type { ParsedUpload } from './types.js';
import type { PostUploadRevision, UploadBlob } from '../revisions/types.api.js';

export class DocumentsParser {
  blobs;
  project;

  constructor(blobs: PostUploadRevision['Body']['blobs'], project: Projects) {
    this.blobs = blobs;
    this.project = project;
  }

  /**
   * Transform raw upload (markdown) to proper Documents
   * It will also create a proper hierarchy of documents if the path are nested.
   */
  parse(): ParsedUpload[] {
    const blobs = this.blobs;

    if (!blobs || blobs.length <= 0) {
      return [];
    }

    const copy = [...blobs];

    // Build folder hierarchy
    const folders = new Map<string, UploadBlob | false>();
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
        hash: hashDocument(blob.content),
        content: this.markdownToProseMirror(blob.content),
      });
    }

    return parsed;
  }

  markdownToProseMirror(content: string): BlockLevelZero {
    const parse: BlockLevelZero = defaultMarkdownParser
      .parse(content)
      ?.toJSON();
    parse.content.forEach((c) => this.iterNode(c));

    return parse;
  }

  /**
   * The markdown parser is compatible with prosemirror but tiptap is using different extension names
   */
  correctNode(node: any) {
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

  correctMark(node: BlockText) {
    if (!node.marks) {
      return;
    }

    for (const mark of node.marks) {
      if (mapMarkType[mark.type as string]) {
        mark.type = mapMarkType[mark.type];
      }

      if (mark.type === 'link') {
        const href = mark.attrs.href;
        if (href.startsWith('#')) {
          // Headers link
          mark.attrs.href = `#h-${href.substring(1)}`;
        } else if (!isLinkAbsolute.test(href) || href.startsWith('/')) {
          mark.attrs.href = href.replace(mdExtension, '');
        }
        // } else if (!isLinkAbsolute.test(href)) {
        //   // Relative
        //   mark.attrs.href = new URL(
        //     href,
        //     `${envs.APP_HOSTNAME}/${this.project.orgId}/${this.project.slug}/content/`
        //   ).href;
        // }
      }
    }
  }

  /**
   * Iterate nodes recursively
   */
  iterNode(node: Blocks) {
    if (node.type === 'hardBreak') {
      return;
    }
    if (node.type === 'text') {
      this.correctMark(node);
      return;
    }

    this.correctNode(node);

    if (!node.attrs) {
      node.attrs = {} as any;
    }
    node.attrs[attrName] = nanoid();
    if ('content' in node && node.content) {
      node.content.forEach((c) => this.iterNode(c));
    }
  }
}
