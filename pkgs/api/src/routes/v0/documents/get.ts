import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError } from '../../../common/errors';
import { toApiUser } from '../../../common/formatters/user';
import { schemaId } from '../../../common/validators';
import { valOrgId, valProjectId } from '../../../common/zod';
import { Document } from '../../../models';
import { TypeHasUser } from '../../../models/typeHasUser';
import type {
  ReqDocumentParams,
  ReqGetDocument,
  ResGetDocument,
} from '../../../types/api';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: valOrgId(req),
      project_id: valProjectId(req),
      document_id: schemaId,
    })
    .strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqGetDocument;
    Params: ReqDocumentParams;
    Reply: ResGetDocument;
  }>('/:document_id', async function (req, res) {
    const val = QueryVal(req).safeParse({ ...req.query, ...req.params });
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query = val.data;
    const p = await Document.findOne({
      where: {
        orgId: query.org_id,
        projectId: query.project_id,
        id: query.document_id,
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
