import type { FastifyPluginCallback } from 'fastify';

import { notFound } from '../../../common/errors';
import { toApiUser } from '../../../common/formatters/user';
import { Document } from '../../../models';
import { TypeHasUser } from '../../../models/typeHasUser';
import type {
  ReqDocumentParams,
  ReqGetDocument,
  ResGetDocument,
} from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqGetDocument;
    Params: ReqDocumentParams;
    Reply: ResGetDocument;
  }>('/:document_id', async function (req, res) {
    const p = await Document.findOne({
      where: {
        // TODO validation
        orgId: req.query.org_id,
        projectId: req.query.project_id,
        id: req.params.document_id,
      },
    });

    if (!p) {
      return notFound(res);
    }

    const users = await TypeHasUser.scope('withUser').findAll({
      where: {
        documentId: p.id,
      },
    });

    res.status(200).send({
      data: {
        id: p.id,
        orgId: p.orgId,
        projectId: p.projectId,
        blobId: p.blobId,

        type: p.type,
        typeId: p.typeId,
        name: p.name,
        slug: p.slug,
        tldr: p.tldr,
        content: p.content as any,
        authors: users
          .filter((user) => user.role === 'author')
          .map((u) => toApiUser(u.user)),
        reviewers: users
          .filter((user) => user.role === 'reviewer')
          .map((u) => toApiUser(u.user)),
        // TODO: fill this
        approvedBy: [],
        locked: p.locked,

        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      },
    });
  });

  done();
};

export default fn;
