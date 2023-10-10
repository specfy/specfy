import { nanoid } from '@specfy/core';
import { client } from '@specfy/es';

import type { Logger } from '@specfy/core';
import type { TechType } from '@specfy/stack-analyser';

import type { CatalogTech } from './types.js';
import type { estypes } from '@elastic/elasticsearch';

interface ListProps {
  orgId: string;
  type: 'all' | TechType;
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
        terms: { field: 'key', order: { _key: 'asc' }, size: 100 },
      },
    },
  };

  if (params.type !== 'all') {
    (q.query!.bool!.must as estypes.QueryDslQueryContainer[]).push({
      term: { type: params.type },
    });
  } else {
    q.aggs!.byType = {
      terms: { field: 'type', order: { _key: 'asc' }, size: 100 },
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
    CatalogTech,
    {
      byName: estypes.AggregationsTermsAggregateBase<{ key: string }>;
      byType?: estypes.AggregationsTermsAggregateBase<{ key: string }>;
    }
  >(q);

  return res;
}

export async function indexTech({
  techs,
  l,
}: {
  techs: CatalogTech[];
  l: Logger;
}) {
  const operations = techs.flatMap((tech) => {
    return [{ index: { _index: 'techs', _id: nanoid(20) } }, tech];
  });
  const bulkResponse = await client.bulk({ refresh: true, operations });

  l.info({ size: operations.length }, 'Indexing techs to ES');

  if (bulkResponse.errors) {
    bulkResponse.items.forEach((action) => {
      l.error(action);
    });
  }
}
