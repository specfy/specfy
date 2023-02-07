import type { FastifyPluginCallback } from 'fastify';

import { notFound } from '../../../common/errors';
import { toApiUser } from '../../../common/formatters/user';
import { Document } from '../../../models';
import { TypeHasUser } from '../../../models/typeHasUser';
import type {
  ReqDocumentParams,
  ReqGetDocument,
  ResGetDocument,
} from '../../../types/api/documents';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqGetDocument;
    Params: ReqDocumentParams;
    Reply: ResGetDocument;
  }>('/:type/:type_id', async function (req, res) {
    const p = await Document.findOne({
      where: {
        // TODO validation
        orgId: req.query.org_id,
        type: req.params.type,
        typeId: req.params.type_id,
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
        type: p.type,
        typeId: p.typeId,
        name: p.name,
        slug: p.slug,
        tldr: p.tldr,
        blocks: p.blocks as any,
        // TODO: fill this
        authors: users
          .filter((user) => user.role === 'author')
          .map((u) => toApiUser(u.user)),
        reviewers: users
          .filter((user) => user.role === 'reviewer')
          .map((u) => toApiUser(u.user)),
        approvedBy: [],
        // TODO: fill this
        create: [],
        remove: [],
        update: [],
        use: [],
        status: p.status,
        locked: p.locked,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      },
    });
  });

  done();
};

export default fn;
