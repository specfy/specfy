import type { FastifyPluginCallback } from 'fastify';

import { db } from '../../../db';
import {
  Project,
  Component,
  Revision,
  RevisionBlob,
  Document,
  TypeHasUser,
} from '../../../models';
import type { ReqPostRevision, ResPostRevision } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Body: ReqPostRevision;
    Reply: ResPostRevision;
  }>('/', async function (req, res) {
    const rev = await db.transaction(async (transaction) => {
      const ids: string[] = [];
      const tmp = { orgId: req.body.orgId, projectId: req.body.projectId };

      for (const blob of req.body.blobs) {
        let blobToModel: Component | Document | Project;

        if (blob.type === 'document') {
          blobToModel = new Document({ ...tmp, ...blob.blob });
        } else if (blob.type === 'component') {
          blobToModel = new Component({ ...tmp, ...blob.blob });
        } else {
          blobToModel = new Project({ ...tmp, ...blob.blob });
        }

        // TODO: validation
        const b = await RevisionBlob.create(
          {
            ...tmp,
            ...blob,
            blob: blobToModel.getJsonForBlob(),
          },
          { transaction }
        );
        ids.push(b.id);
      }

      // TODO: validation
      const revision = await Revision.create(
        {
          orgId: req.body.orgId,
          projectId: req.body.projectId,
          title: req.body.title,
          description: req.body.description,
          status: 'draft',
          merged: false,
          blobs: ids,
        },
        { transaction }
      );

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
