import { Prisma } from '@prisma/client';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { nanoid } from '../../../common/id';
import { schemaBlobs } from '../../../common/validators';
import { schemaRevision } from '../../../common/validators/revision';
import { valOrgId, valProjectId } from '../../../common/zod';
import { prisma } from '../../../db';
import { noQuery } from '../../../middlewares/noQuery';
import { createRevisionActivity } from '../../../models/revision';
import type { ReqPostRevision, ResPostRevision } from '../../../types/api';

function BodyVal(req: FastifyRequest) {
  return z
    .object({
      orgId: valOrgId(req),
      projectId: valProjectId(req),
      name: schemaRevision.shape.name,
      description: schemaRevision.shape.description,
      blobs: schemaBlobs,
    })
    .strict()
    .superRefine((val, ctx) => {
      const orgId = val.orgId;
      const projectId = val.projectId;
      for (let index = 0; index < val.blobs.length; index++) {
        const blob = val.blobs[index];

        // Check belongs to same org
        if (blob.blob.orgId !== orgId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            params: { code: 'incompatible_fields' },
            message:
              "Blob's content should be in the same org as the blob definition",
            path: ['blobs', index, 'orgId'],
          });
        }

        // Check belongs to same project
        if ('projectId' in blob.blob && blob.blob.projectId !== projectId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            params: { code: 'incompatible_fields' },
            message:
              "Blob's content should be in the same project as the blob definition",
            path: ['blobs', index, 'projectId'],
          });
        }

        // Check not edit an other project
        if (blob.type === 'project' && blob.blob.id !== projectId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            params: { code: 'incompatible_fields' },
            message: 'Project blob can not be an other project',
            path: ['blobs', index, 'id'],
          });
        }
      }
    });
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Body: ReqPostRevision;
    Reply: ResPostRevision;
  }>('/', { preHandler: noQuery }, async function (req, res) {
    const val = BodyVal(req).safeParse(req.body);
    if (!val.success) {
      return validationError(res, val.error);
    }

    // TODO: validate all ids
    const data = val.data;

    const rev = await prisma.$transaction(async (tx) => {
      const ids: string[] = [];

      for (const blob of data.blobs) {
        let blobToModel: any | typeof Prisma.DbNull = Prisma.DbNull;

        if (!blob.deleted && blob.blob) {
          blobToModel = blob.blob as any;
        }

        // TODO: validation
        const b = await tx.blobs.create({
          data: {
            id: nanoid(),
            ...blob,
            blob: blobToModel,
          },
        });
        ids.push(b.id);
      }

      // TODO: validation
      const revision = await tx.revisions.create({
        data: {
          id: nanoid(),
          orgId: data.orgId,
          projectId: data.projectId,
          name: data.name,
          description: data.description as any,
          status: 'draft',
          merged: false,
          blobs: ids,
        },
      });
      await createRevisionActivity(req.user!, 'Revision.created', revision, tx);

      await tx.typeHasUsers.create({
        data: { revisionId: revision.id, role: 'author', userId: req.user!.id },
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
