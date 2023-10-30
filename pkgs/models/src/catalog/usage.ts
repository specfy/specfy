import { isTest, l as logger } from '@specfy/core';
import { client } from '@specfy/es';

import type { GetCatalogUser } from './types.api.js';
import type { CommitIndex } from './types.js';
import type { CommitAnalysis } from '../sync.js';
import type { estypes } from '@elastic/elasticsearch';

export async function indexCommit({
  orgId,
  projectId,
  sourceId,
  userId,
  commit,
}: {
  orgId: string;
  projectId: string;
  sourceId: string;
  userId: string | null;
  commit: CommitAnalysis;
}) {
  const hash = commit.info.hash;
  try {
    logger.info({ sourceId, hash }, 'Indexing commit to ES');
    await client.index({
      index: 'tech_usage',
      id: `${sourceId}:${hash}`,
      refresh: isTest,
      document: {
        orgId,
        projectId,
        sourceId,
        userId,
        hash,
        username: commit.info.author,
        techs: commit.techs,
        date: commit.info.date,
      },
    });
  } catch (err) {
    logger.error({ err }, 'error during commit indexing to es');
  }
}

export async function getUserActivities({
  orgId,
  techId,
}: {
  orgId: string;
  techId: string;
}) {
  const q: estypes.SearchRequest = {
    index: 'tech_usage',
    size: 0,
    sort: [{ username: 'asc' }, '_score'],
    track_total_hits: true,
    query: {
      // @ts-expect-error
      bool: {
        must: [
          { term: { orgId } },
          { term: { techs: techId } },
          { range: { date: { gte: 'now-90d/d', lte: 'now/d' } } },
        ],
      },
    },
    aggs: {
      byUserId: {
        terms: { field: 'userId', order: { _key: 'asc' }, size: 1000 },
        aggregations: {
          min_date: { min: { field: 'date', format: 'yyyy-MM-dd' } },
          max_date: { max: { field: 'date', format: 'yyyy-MM-dd' } },
        },
      },
      byUsername: {
        filter: {
          // @ts-expect-error
          bool: {
            must_not: {
              exists: {
                field: 'userId',
              },
            },
          },
        },
        aggregations: {
          agg: {
            terms: { field: 'username', order: { _key: 'asc' }, size: 1000 },
            aggregations: {
              min_date: { min: { field: 'date', format: 'yyyy-MM-dd' } },
              max_date: { max: { field: 'date', format: 'yyyy-MM-dd' } },
            },
          },
        },
      },
      histogram: {
        date_histogram: { field: 'date', calendar_interval: '1d' },
      },
    },
  };

  const res = await client.search<
    CommitIndex,
    {
      byUsername: estypes.AggregationsMultiBucketBase & {
        agg: estypes.AggregationsTermsAggregateBase;
      };
      byUserId: estypes.AggregationsTermsAggregateBase<{ key: string }>;
      histogram: estypes.AggregationsDateHistogramAggregate;
    }
  >(q);

  return res;
}

export function scoreUser(
  update: GetCatalogUser,
  now: number,
  totalTech: number
) {
  const daysElapsed =
    Math.floor(now / (3600 * 1000 * 24)) -
    Math.floor(update.lastUpdate / (3600 * 1000 * 24));

  const score =
    // base score
    10 -
    // remove point based on number of updates
    (update.count > 14 ? 0 : Math.log(15 - update.count) * 1.9) -
    // remove point if guest (could be a bot, automation or noise)
    (update.type === 'user' ? 0 : 2) -
    // remove points based on recency
    (daysElapsed > 10 ? Math.min(5, Math.log(daysElapsed) * 1.2) : 0) -
    // remove points based on reverse percentage of commits
    Math.abs(Math.log(update.count / totalTech));

  return Math.round(Math.max(0, Math.min(10, score)));
}
