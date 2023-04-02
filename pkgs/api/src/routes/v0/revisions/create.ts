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
    .strict();
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
      const tmp = { orgId: data.orgId, projectId: data.projectId };

      for (const blob of data.blobs) {
        let blobToModel: any | typeof Prisma.DbNull = Prisma.DbNull;

        if (!blob.deleted && blob.blob) {
          blobToModel = { ...tmp, ...blob.blob } as any;
        }

        // TODO: validation
        const b = await tx.blobs.create({
          data: {
            id: nanoid(),
            ...tmp,
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
