import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { nanoid } from '../../../common/id.js';
import {
  schemaBlobs,
  schemaId,
  schemaOrgId,
} from '../../../common/validators/index.js';
import { schemaRevision } from '../../../common/validators/revision.js';
import { valPermissions } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { createBlobs, createRevisionActivity } from '../../../models/index.js';
import type { ApiBlobCreate, PostRevision } from '../../../types/api/index.js';

function BodyVal(req: FastifyRequest) {
  return z
    .object({
      orgId: schemaOrgId,
      projectId: schemaId,
      name: schemaRevision.shape.name,
      description: schemaRevision.shape.description,
      blobs: schemaBlobs,
    })
    .strict()
    .superRefine(valPermissions(req))
    .superRefine((val, ctx) => {
      const orgId = val.orgId;
      const projectId = val.projectId;
      for (let index = 0; index < val.blobs.length; index++) {
        const blob = val.blobs[index];

        // Check belongs to same org
        if (blob.current?.orgId !== orgId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            params: { code: 'incompatible_fields' },
            message:
              "Blob's content should be in the same org as the blob definition",
            path: ['blobs', index, 'orgId'],
          });
        }

        // Check belongs to same project
        if (
          blob.current &&
          'projectId' in blob.current &&
          blob.current.projectId !== projectId
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            params: { code: 'incompatible_fields' },
            message:
              "Blob's content should be in the same project as the blob definition",
            path: ['blobs', index, 'projectId'],
          });
        }

        // Check not edit an other project
        if (blob.type === 'project' && blob.current?.id !== projectId) {
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
  fastify.post<PostRevision>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const val = BodyVal(req).safeParse(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      // TODO: validate all ids
      const data = val.data;

      const rev = await prisma.$transaction(async (tx) => {
        const ids = await createBlobs(data.blobs as ApiBlobCreate[], tx);

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
        await createRevisionActivity({
          user: req.user!,
          action: 'Revision.created',
          target: revision,
          tx,
        });

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
    }
  );

  done();
};

export default fn;
