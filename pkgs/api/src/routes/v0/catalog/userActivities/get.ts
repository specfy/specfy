import { schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { getUserActivities, scoreUser, toApiUserPublic } from '@specfy/models';
import { z } from 'zod';

import type { GetCatalogUser, GetCatalogUserActivities } from '@specfy/models';

import { notFound, validationError } from '../../../../common/errors.js';
import { valPermissions } from '../../../../common/zod.js';

import type { estypes } from '@elastic/elasticsearch';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

interface Agg {
  key: string;
  doc_count: number;
  min_date: { value: number };
  max_date: { value: number };
}
function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      tech_id: z.string().min(2).max(100),
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetCatalogUserActivities>('/', async function (req, res) {
    const val = QueryVal(req).safeParse({ ...req.query, ...req.params });
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query: GetCatalogUserActivities['QP'] = val.data;

    const catalog = await getUserActivities({
      orgId: query.org_id,
      techId: query.tech_id,
    });
    const byUsername = catalog.aggregations!.byUsername!;
    const byUserId = catalog.aggregations!.byUserId!;

    const total = (catalog.hits.total! as estypes.SearchTotalHits).value;
    if (total <= 0) {
      return notFound(res);
    }

    const userIds: string[] = [];
    let totalTech = 0;
    const tmp = (byUserId.buckets as Agg[]).map((user) => {
      totalTech += user.doc_count;
      userIds.push(user.key);
      return {
        type: 'user',
        userId: user.key,
        count: user.doc_count,
        firstUpdate: user.min_date.value,
        lastUpdate: user.max_date.value,
      };
    });

    const users: GetCatalogUser[] = [];

    // Users
    if (userIds.length > 0) {
      const refs = await prisma.users.findMany({
        where: { id: { in: userIds } },
      });
      for (const user of tmp) {
        const ref = refs.find((r) => r.id === user.userId);
        if (!ref) {
          continue;
        }
        users.push({
          type: 'user',
          trend: 'bad',
          score: 0,
          profile: toApiUserPublic(ref),
          count: user.count,
          firstUpdate: user.firstUpdate,
          lastUpdate: user.lastUpdate,
        });
      }
    }
    // Guests
    if (byUsername.agg.buckets) {
      for (const guest of byUsername.agg.buckets as Agg[]) {
        totalTech += guest.doc_count;
        users.push({
          type: 'guest',
          trend: 'bad',
          score: 0,
          username: guest.key,
          count: guest.doc_count,
          firstUpdate: guest.min_date.value,
          lastUpdate: guest.max_date.value,
        });
      }
    }

    // Compute score for each users
    const now = Date.now();
    for (const user of users) {
      user.score = scoreUser(user, now, totalTech);
      user.trend = user.score > 8 ? 'good' : user.score > 5 ? 'warn' : 'bad';
    }

    // Get activities histogram
    const histogram = (
      catalog.aggregations?.histogram.buckets as Array<{
        key: number;
        doc_count: number;
      }>
    ).map((t) => {
      return { count: t.doc_count, date: t.key };
    });

    return res.status(200).send({
      data: {
        total,
        totalForTech: totalTech,
        users,
        histogram,
      },
    });
  });
  done();
};

export default fn;
