import { isTest, l as logger } from '@specfy/core';
import { prisma, type Accounts, type Orgs, type Projects } from '@specfy/db';
import { baseDelete, client } from '@specfy/es';

import type { Logger } from '@specfy/core';

import type { GetCatalogUser } from './types.api.js';
import type { CommitIndex } from './types.js';
import type { CommitAnalysis } from '../sync.js';
import type { estypes } from '@elastic/elasticsearch';

export async function indexCommits({
  commits,
  l = logger,
}: {
  commits: CommitIndex[];
  l?: Logger;
}) {
  const operations = commits.flatMap((commit) => {
    return [
      {
        index: {
          _index: 'tech_usage',
          _id: `${commit.sourceId}:${commit.hash}`,
        },
      },
      commit,
    ];
  });
  l.info({ size: operations.length }, 'Indexing commits to ES');
  const bulkResponse = await client.bulk({ refresh: isTest, operations });

  if (bulkResponse.errors) {
    bulkResponse.items.forEach((action) => {
      l.error(action);
    });
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
        terms: { field: 'authors.id', size: 1000 },
        aggregations: {
          min_date: { min: { field: 'date', format: 'yyyy-MM-dd' } },
          max_date: { max: { field: 'date', format: 'yyyy-MM-dd' } },
        },
      },
      byUsername: {
        filter: {
          // @ts-expect-error
          bool: {
            must_not: { exists: { field: 'authors.id' } },
          },
        },
        aggregations: {
          agg: {
            terms: {
              field: 'authors.name',
              order: { _key: 'asc' },
              size: 1000,
            },
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

export async function removeUserActivitiesByProject({
  project,
}: {
  project: Projects;
}) {
  await client.deleteByQuery({
    index: 'tech_usage',
    ...baseDelete,
    query: {
      // @ts-expect-error
      bool: {
        must: [
          { term: { projectId: project.id } },
          { term: { orgId: project.orgId } },
        ],
      },
    },
  });
}

export async function removeUserActivitiesByOrg({ org }: { org: Orgs }) {
  await client.deleteByQuery({
    index: 'tech_usage',
    ...baseDelete,
    query: {
      // @ts-expect-error
      bool: {
        must: [{ term: { orgId: org.id } }],
      },
    },
  });
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

export async function formatCommitsToIndex({
  orgId,
  projectId,
  sourceId,
  commits,
  emails,
}: {
  orgId: string;
  projectId: string;
  sourceId: string;
  commits: CommitAnalysis[];
  emails: string[];
}): Promise<CommitIndex[]> {
  // Fetch emails matching user accounts
  const accounts: Array<Pick<Accounts, 'userId' | 'emails'>> =
    emails.length > 0
      ? await prisma.accounts.findMany({
          select: { userId: true, emails: true },
          where: { emails: { hasSome: emails } },
        })
      : [];

  // Format for indexing
  const formatted: CommitIndex[] = [];
  for (const an of commits) {
    const authors: CommitIndex['authors'] = [];
    for (const author of an.info.authors) {
      const acc = accounts.find((a) => a.emails.includes(author.email));
      authors.push({
        id: acc?.userId || null,
        ...author,
      });
    }

    formatted.push({
      orgId,
      projectId,
      sourceId,
      hash: an.info.hash,
      techs: an.techs,
      date: an.info.date.toISOString(),
      authors,
    });
  }

  return formatted;
}
