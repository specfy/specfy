import type { Pagination, Res } from '@specfy/core';
import type { TechType } from '@specfy/stack-analyser';

// GET /
export type CatalogItem = { key: string; count: number };
export type ListCatalog = Res<{
  Querystring: {
    org_id: string;
    type: TechType | 'all';
  };
  Success: {
    data: { byName: CatalogItem[]; byType: CatalogItem[] | null };
    pagination: Pagination;
  };
}>;
