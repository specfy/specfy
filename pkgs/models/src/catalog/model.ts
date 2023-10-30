import { isTest, nanoid } from '@specfy/core';
import { client } from '@specfy/es';

import type { Logger } from '@specfy/core';
import type { Jobs, Orgs, Projects } from '@specfy/db';

import type { ListCatalog } from './types.api.js';
import type { CatalogTechIndex } from './types.js';
import type { estypes } from '@elastic/elasticsearch';

interface ListProps {
  orgId: string;
  type: ListCatalog['Querystring']['type'];
}

export async function catalogList(params: ListProps) {
  const q: estypes.SearchRequest = {
    index: 'techs',
    size: 0,
    sort: [{ name: 'asc' }, '_score'],
    track_total_hits: true,
    query: {
      // @ts-expect-error
      bool: {
        must: [{ term: { orgId: params.orgId } }],
      },
    },
    _source: ['key', 'name', 'type'],
    aggs: {
      byName: {
        terms: { field: 'key', order: { _key: 'asc' }, size: 1000 },
      },
    },
  };

  if (params.type !== 'all') {
    (q.query!.bool!.must as estypes.QueryDslQueryContainer[]).push({
      term: { type: params.type },
    });
  } else {
    q.aggs!.byType = {
      terms: { field: 'type', order: { _key: 'asc' }, size: 1000 },
      aggs: {
        distinct: {
          cardinality: {
            field: 'name',
          },
        },
      },
    };
  }

  const res = await client.search<
    CatalogTechIndex,
    {
      byName: estypes.AggregationsTermsAggregateBase<{ key: string }>;
      byType?: estypes.AggregationsTermsAggregateBase<{ key: string }>;
    }
  >(q);

  return res;
}

interface GetProps {
  orgId: string;
  techId: string;
}
export async function catalogGet(params: GetProps) {
  const q: estypes.SearchRequest = {
    index: 'techs',
    size: 1,
    track_total_hits: true,
    query: {
      // @ts-expect-error
      bool: {
        must: [
          { term: { orgId: params.orgId } },
          { term: { key: params.techId } },
        ],
      },
    },
    _source: ['key', 'name', 'type'],
    aggs: {
      byProject: {
        terms: { field: 'projectId', order: { _key: 'asc' }, size: 1000 },
      },
    },
  };

  const res = await client.search<
    CatalogTechIndex,
    {
      byProject: estypes.AggregationsTermsAggregateBase<{ key: string }>;
    }
  >(q);

  return res;
}

export async function indexTech({
  techs,
  l,
}: {
  techs: CatalogTechIndex[];
  l: Logger;
}) {
  const operations = techs.flatMap((tech) => {
    return [{ index: { _index: 'techs', _id: nanoid(20) } }, tech];
  });
  l.info({ size: operations.length }, 'Indexing techs to ES');
  const bulkResponse = await client.bulk({ refresh: isTest, operations });

  if (bulkResponse.errors) {
    bulkResponse.items.forEach((action) => {
      l.error(action);
    });
  }
}

const baseDelete = {
  // In production we do not care that ES is cleaned synchronously
  wait_for_completion: false,
  // It will ignore all conflicts on document
  conflicts: 'proceed',
  // Make sure shards refresh after the delete
  refresh: isTest === true,
};
export async function removeTechByJob({ job }: { job: Jobs }) {
  await client.deleteByQuery({
    index: 'techs',
    ...baseDelete,
    query: {
      // @ts-expect-error
      bool: {
        must: [
          { term: { projectId: job.projectId } },
          { term: { orgId: job.orgId } },
        ],
        must_not: [{ term: { jobId: job.id } }],
      },
    },
  });
}

export async function removeTechByProject({ project }: { project: Projects }) {
  await client.deleteByQuery({
    index: 'techs',
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

export async function removeTechByOrg({ org }: { org: Orgs }) {
  await client.deleteByQuery({
    index: 'techs',
    ...baseDelete,
    query: {
      // @ts-expect-error
      bool: { must: [{ term: { orgId: org.id } }] },
    },
  });
}
