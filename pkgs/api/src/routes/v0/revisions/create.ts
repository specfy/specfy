import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { schemaBlobs } from '../../../common/validators';
import { schemaRevision } from '../../../common/validators/revision';
import { valOrgId, valProjectId } from '../../../common/zod';
import { db } from '../../../db';
import { noQuery } from '../../../middlewares/noQuery';
import {
  Project,
  Component,
  Revision,
  RevisionBlob,
  Document,
  TypeHasUser,
} from '../../../models';
import type {
  ApiComponent,
  ApiDocument,
  ApiProject,
  BlockLevelZero,
  ReqPostRevision,
  ResPostRevision,
} from '../../../types/api';

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

    const rev = await db.transaction(async (transaction) => {
      const ids: string[] = [];
      const tmp = { orgId: data.orgId, projectId: data.projectId };

      for (const blob of data.blobs) {
        let blobToModel: Component | Document | Project | null = null;

        if (!blob.deleted && blob.blob) {
          if (blob.type === 'document') {
            blobToModel = new Document({ ...tmp, ...blob.blob } as ApiDocument);
          } else if (blob.type === 'component') {
            blobToModel = new Component({
              ...tmp,
              ...blob.blob,
            } as ApiComponent);
          } else {
            blobToModel = new Project({ ...tmp, ...blob.blob } as ApiProject);
          }
        }

        // TODO: validation
        const b = await RevisionBlob.create(
          {
            ...tmp,
            ...blob,
            blob: blobToModel ? blobToModel.getJsonForBlob() : null,
          },
          { transaction }
        );
        ids.push(b.id);
      }

      // TODO: validation
      const revision = await Revision.create(
        {
          orgId: data.orgId,
          projectId: data.projectId,
          name: data.name,
          description: data.description as BlockLevelZero,
          status: 'draft',
          merged: false,
          blobs: ids,
        },
        { transaction }
      );
      await revision.onAfterCreate(req.user!, { transaction });

      await TypeHasUser.create({
        revisionId: revision.id,
        role: 'author',
        userId: req.user!.id,
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
