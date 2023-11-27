import type { Pagination, Res } from '@specfy/core';
import type { TechType } from '@specfy/stack-analyser';

import type { CatalogTechIndex } from './types.js';
import type { ApiUserPublic } from '../users/types.api.js';

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
      tech: Pick<CatalogTechIndex, 'name' | 'key' | 'type'>;
    };
  };
}>;

// GET /:tech_id/user_activities
export type GetCatalogBase = {
  score: number;
  count: number;
  trend: 'good' | 'warn' | 'bad';
  firstUpdate: number;
  lastUpdate: number;
};
export type GetCatalogLogged = {
  type: 'user';
  profile: ApiUserPublic;
} & GetCatalogBase;
export type GetCatalogGuest = {
  type: 'guest';
  username: string;
} & GetCatalogBase;
export type GetCatalogUser = GetCatalogLogged | GetCatalogGuest;

export type GetCatalogUserActivities = Res<{
  Params: { tech_id: string };
  Querystring: { org_id: string };
  Success: {
    data: {
      total: number;
      totalForTech: number;
      users: GetCatalogUser[];
      histogram: Array<{ count: number; date: number }>;
    };
  };
}>;

// GET /summary
export type GetCatalogSummary = Res<{
  Querystring: { org_id: string };
  Success: {
    data: { count: number };
  };
}>;
