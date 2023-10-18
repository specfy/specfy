import type { Pagination, Res } from '@specfy/core';
import type { TechType } from '@specfy/stack-analyser';

import type { CatalogTech } from './types.js';

// GET /
export type CatalogItem = { key: string; count: number };
export type ListCatalog = Res<{
  Querystring: { org_id: string; type: TechType | 'all' | 'unknown' };
  Success: {
    data: { byName: CatalogItem[]; byType: CatalogItem[] | null };
    pagination: Pagination;
  };
}>;

// GET /:tech_id
export type GetCatalog = Res<{
  Params: { tech_id: string };
  Querystring: { org_id: string };
  Success: {
    data: {
      byProject: string[];
      tech: Pick<CatalogTech, 'name' | 'key' | 'type'>;
    };
  };
}>;
