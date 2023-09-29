import type { Res } from '@specfy/core';
import type { Sources } from '@specfy/db';

export type ApiSource = Sources;
export interface ReqSourceParams {
  source_id: string;
}
export interface ReqSourceQuery {
  org_id: string;
  project_id: string;
}

// GET /
export type ListSources = Res<{
  Querystring: ReqSourceQuery;
  Success: { data: ApiSource[] };
}>;

// POST /
export type PostSource = Res<{
  Body: Omit<
    ApiSource,
    'id' | 'createdAt' | 'updatedAt' | 'name' | 'enable'
  > & {
    name?: string | undefined;
  };
  Success: { data: Pick<ApiSource, 'id'> };
}>;

// PUT /:source_id
export type PutSource = Res<{
  Params: ReqSourceParams;
  Querystring: ReqSourceQuery;
  Body: {
    name: string;
    settings: ApiSource['settings'];
  };
  Success: { data: ApiSource };
}>;

// DELETE /:source_id
export type DeleteSource = Res<{
  Params: ReqSourceParams;
  Querystring: ReqSourceQuery;
  Success: never;
}>;
