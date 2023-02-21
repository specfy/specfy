import type { FastifyPluginCallback } from 'fastify';

import { notFound } from '../../../common/errors';
import { db } from '../../../db';
import {
  Component,
  Project,
  Revision,
  RevisionBlob,
  Document,
} from '../../../models';
import type {
  ReqGetRevision,
  ReqRevisionParams,
  ResMergeRevision,
} from '../../../types/api/revisions';
import {
  isComponentBlob,
  isDocumentBlob,
  isProjectBlob,
} from '../../../types/db/blobs';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Params: ReqRevisionParams;
    Querystring: ReqGetRevision;
    Reply: ResMergeRevision;
  }>('/', async function (req, res) {
    // Use /get
    const rev = await Revision.findOne({
      where: {
        // TODO validation
        orgId: req.query.org_id,
        projectId: req.query.project_id,
        id: req.params.revision_id,
      },
    });

    if (!rev) {
      return notFound(res);
    }

    // TODO: check who can merge
    // TODO: check if we are up to date
    const list = await RevisionBlob.findAll({
      where: {
        id: rev.blobs,
      },
      order: [['createdAt', 'ASC']],
      limit: 100,
      offset: 0,
    });

    await db.transaction(async (transaction) => {
      // Update all blobs
      for (const blob of list) {
        if (isDocumentBlob(blob)) {
          const prev = (await Document.findOne({
            where: { blobId: blob.parentId },
            transaction,
          }))!;

          await prev.update({ ...blob.blob, blobId: blob.id }, { transaction });
        } else if (isComponentBlob(blob)) {
          const prev = (await Component.findOne({
            where: { blobId: blob.parentId },
            transaction,
          }))!;

          await prev.update({ ...blob.blob, blobId: blob.id }, { transaction });
        } else if (isProjectBlob(blob)) {
          console.log('here');

          const prev = (await Project.findOne({
            where: { blobId: blob.parentId },
            transaction,
          }))!;
          console.log('hello');

          await prev.update({ ...blob.blob, blobId: blob.id }, { transaction });
          console.log('yo');
        } else {
          console.error('unsupported blob');
        }
      }
      console.log('ya');

      // Update revision
      await rev.update(
        {
          merged: true,
          mergedAt: new Date().toISOString(),
        },
        { transaction }
      );
    });

    res.status(200).send({
      data: {
        done: true,
      },
    });
  });

  done();
};

export default fn;
