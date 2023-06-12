import path from 'node:path';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { defaultMarkdownParser } from 'prosemirror-markdown';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { nanoid } from '../../../common/id';
import { slugify } from '../../../common/string';
import { schemaRevision } from '../../../common/validators/revision';
import { valOrgId, valProjectId } from '../../../common/zod';
import { prisma } from '../../../db';
import { noQuery } from '../../../middlewares/noQuery';
import { createBlobs, createRevisionActivity } from '../../../models';
import type {
  ApiBlobCreate,
  ApiBlobCreateDocument,
  BlockLevelZero,
  Blocks,
  ReqPostUploadRevision,
  ResPostUploadRevision,
} from '../../../types/api';
import type { DBDocument } from '../../../types/db';

function BodyVal(req: FastifyRequest) {
  return z
    .object({
      orgId: valOrgId(req),
      projectId: valProjectId(req),
      name: schemaRevision.shape.name,
      description: schemaRevision.shape.description,
      source: z.literal('github'),
      stack: z.object({}).nullable(), // TODO: validate this
      blobs: z
        .array(
          z
            .object({
              path: z.string().max(255),
              content: z.string().max(99999),
            })
            .strict()
        )
        .min(0)
        .max(100),
    })
    .strict();
}

const attrName = 'uid';
function correctNode(node: any) {
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
  } else if (node.type.includes('_')) {
    throw new Error(`unsupported block, ${node.type}`);
  }
}

function iterNode(node: Blocks) {
  if (node.type === 'text' || node.type === 'hardBreak') {
    return;
  }

  correctNode(node);

  if (!node.attrs) {
    node.attrs = {} as any;
  }
  node.attrs[attrName] = nanoid();
  if ('content' in node) {
    node.content.forEach(iterNode);
  }
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Body: ReqPostUploadRevision;
    Reply: ResPostUploadRevision;
  }>('/', { preHandler: noQuery }, async function (req, res) {
    const val = BodyVal(req).safeParse(req.body);
    if (!val.success) {
      return validationError(res, val.error);
    }

    // TODO: validate all ids
    const data = val.data;

    // ---- Check if every path has a parent folder
    const checkedFolder = new Set<string>('/');
    const copy = [...data.blobs];
    const checked: Array<
      ReqPostUploadRevision['blobs'][0] & { folder: string }
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

      const folder = path.join(path.dirname(blob.path), '/');
      if (checkedFolder.has(folder)) {
        checked.push({ ...blob, folder });

        continue;
      }

      // Exact match, unlikely with regular file upload but since it's an API it can be manually setup
      const parent = copy.findIndex((b) => b.path === folder);
      if (parent > -1) {
        checked.push({ ...copy[parent], folder });
        checked.push({ ...blob, folder });
        checkedFolder.add(folder);
        delete copy[parent];

        continue;
      }

      // There is an index.md which is good enough source
      const index = path.join(folder, 'index.md');
      const dup = copy.findIndex((b) => b.path.toLowerCase() === index);
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
    // for (const blob of data.blobs) {
    //   const folder = path.join(path.dirname(blob.path), '/');
    //   if (checkedFolder.has(folder)) {
    //     if (folder !== blob.path) {
    //       checked.push({ ...blob, folder });
    //     }
    //     continue;
    //   }

    //   checked.push({ ...blob, folder });

    //   // Exact match, unlikely with regular file upload but since it's an API it can be manually setup
    //   const parent = data.blobs.find((b) => b.path === folder);
    //   if (parent) {
    //     checked.push({ ...parent, folder });
    //     checkedFolder.add(folder);
    //     continue;
    //   }

    //   // There is an index.md which is good enough source
    //   const index = path.join(folder, 'index.md');
    //   const dup = data.blobs.find((b) => b.path.toLowerCase() === index);
    //   if (dup) {
    //     checked.push({ ...dup, path: folder, folder });
    //     checkedFolder.add(folder);

    //     continue;
    //   }

    //   // No match, we create an empty folder
    //   checked.push({ content: '', path: folder, folder });
    //   checkedFolder.add(folder);
    // }

    console.log(checked);

    // ---- Sort
    // We also sort:
    // 1. Because Prisma does not support Deferrable fk check  https://github.com/prisma/prisma/issues/8807
    // 2. And it creates better Revisions
    const sorted = checked.sort((a, b) => (a.path > b.path ? 1 : -1));

    // ---- Transform content into a ProseMirror object
    const parsed: Array<{ path: string; content: BlockLevelZero }> = [];
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

    const rev = await prisma.$transaction(async (tx) => {
      const prevs = await tx.documents.findMany({
        where: {
          orgId: data.orgId,
          projectId: data.projectId,
          type: 'doc',
        },
        take: 1000,
        skip: 0,
      });

      // ---- Prepare blobs for create or update
      const now = new Date().toISOString();
      const blobs: ApiBlobCreateDocument[] = parsed.map((doc) => {
        const prev = prevs.find((p) => p.sourcePath === doc.path);

        let name = prev
          ? prev.name
          : path.basename(doc.path).replace('.md', '');

        if (
          doc.content.content.length > 0 &&
          doc.content.content[0].type === 'heading'
        ) {
          name = doc.content.content[0].content[0].text;
          doc.content.content.shift();
        }

        const current: DBDocument = prev
          ? {
              ...(prev as unknown as DBDocument),
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
          typeId: prev ? prev.id : nanoid(),
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

      // ---- Create Deleted blobs
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

      const ids = await createBlobs([...blobs, ...deleted], tx);

      // TODO: validation
      const revision = await tx.revisions.create({
        data: {
          id: nanoid(),
          orgId: data.orgId,
          projectId: data.projectId,
          name: data.name,
          description: data.description as any,
          status: 'approved',
          merged: false,
          blobs: ids,
        },
      });
      await createRevisionActivity(req.user!, 'Revision.created', revision, tx);

      await tx.reviews.create({
        data: {
          id: nanoid(),
          orgId: data.orgId,
          projectId: data.projectId,
          revisionId: revision.id,
          userId: req.user!.id,
          commentId: null,
        },
      });
      await createRevisionActivity(
        req.user!,
        'Revision.approved',
        revision,
        tx
      );

      await tx.typeHasUsers.create({
        data: {
          revisionId: revision.id,
          role: 'author',
          userId: req.user!.id,
        },
      });

      return revision;
    });

    res.status(200).send({
      id: rev.id,
    });
  });

  done();
};

export default fn;
