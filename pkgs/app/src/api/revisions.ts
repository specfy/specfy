import type {
  ReqPostRevision,
  ReqGetRevision,
  ResGetRevision,
  ResPostRevision,
  ReqListRevisions,
  ResListRevisions,
  ReqRevisionParams,
  ResMergeRevision,
  ResCheckRevision,
  ReqPutRevision,
  ResPutRevision,
} from 'api/src/types/api';
import { useQuery } from 'react-query';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';

export type QueryParamsRev = ReqGetRevision & ReqRevisionParams;

export async function createRevision(
  data: ReqPostRevision
): Promise<ResPostRevision> {
  const { json } = await fetchApi<ResPostRevision, undefined, ReqPostRevision>(
    '/revisions',
    { body: data },
    'POST'
  );

  queryClient.removeQueries(['listRevisions', data.orgId, data.projectId]);
  queryClient.removeQueries(['listActivities', data.orgId]);

  return json;
}

export async function updateRevision(
  { org_id, project_id, revision_id }: ReqGetRevision & ReqRevisionParams,
  data: ReqPutRevision
): Promise<ResPutRevision> {
  const { json } = await fetchApi<
    ResPutRevision,
    ReqGetRevision,
    ReqPutRevision
  >(
    `/revisions/${revision_id}`,
    { body: data, qp: { org_id, project_id } },
    'PUT'
  );

  queryClient.removeQueries(['listRevisions', org_id, project_id]);
  queryClient.removeQueries(['listBlobs', org_id, project_id, revision_id]);
  queryClient.removeQueries(['getRevision', org_id, project_id, revision_id]);
  queryClient.removeQueries([
    'getRevisionChecks',
    org_id,
    project_id,
    revision_id,
  ]);

  return json;
}

export function useListRevisions(opts: ReqListRevisions) {
  return useQuery({
    queryKey: [
      'listRevisions',
      opts.org_id,
      opts.project_id,
      opts.status,
      opts.search,
    ],
    queryFn: async (): Promise<ResListRevisions> => {
      const { json } = await fetchApi<ResListRevisions, ReqListRevisions>(
        '/revisions',
        {
          qp: opts,
        }
      );

      return json;
    },
  });
}

export function useGetRevision({
  org_id,
  project_id,
  revision_id,
}: ReqGetRevision & ReqRevisionParams) {
  return useQuery({
    queryKey: ['getRevision', org_id, project_id, revision_id],
    queryFn: async (): Promise<ResGetRevision> => {
      const { json } = await fetchApi<ResGetRevision, ReqGetRevision>(
        `/revisions/${revision_id}`,
        {
          qp: { org_id, project_id },
        }
      );

      return json;
    },
  });
}

export async function mergeRevision({
  org_id,
  project_id,
  revision_id,
}: ReqGetRevision & ReqRevisionParams): Promise<ResMergeRevision> {
  const { json, res } = await fetchApi<ResMergeRevision, ReqGetRevision>(
    `/revisions/${revision_id}/merge`,
    {
      qp: { org_id, project_id },
    },
    'POST'
  );

  if (res.status === 200) {
    queryClient.removeQueries(['listRevisions', org_id, project_id]);
    queryClient.removeQueries(['getRevision', org_id, project_id]);
    queryClient.refetchQueries(['getRevisionChecks', org_id, project_id]);
  } else {
    queryClient.refetchQueries([
      'getRevisionChecks',
      org_id,
      project_id,
      revision_id,
    ]);
  }

  return json;
}

export function useGetRevisionChecks({
  org_id,
  project_id,
  revision_id,
}: Partial<ReqRevisionParams> & ReqGetRevision) {
  return useQuery({
    enabled: !!revision_id,
    queryKey: ['getRevisionChecks', org_id, project_id, revision_id],
    queryFn: async (): Promise<ResCheckRevision> => {
      const { json } = await fetchApi<ResCheckRevision, ReqGetRevision>(
        `/revisions/${revision_id}/checks`,
        {
          qp: { org_id, project_id },
        }
      );

      return json;
    },
  });
}

export async function rebaseRevision({
  org_id,
  project_id,
  revision_id,
}: ReqGetRevision & ReqRevisionParams): Promise<ResMergeRevision> {
  const { json, res } = await fetchApi<ResMergeRevision, ReqGetRevision>(
    `/revisions/${revision_id}/rebase`,
    {
      qp: { org_id, project_id },
    },
    'POST'
  );

  if (res.status === 200) {
    queryClient.removeQueries(['listRevisions', org_id, project_id]);
    queryClient.removeQueries(['listBlobs', org_id, project_id, revision_id]);
    queryClient.removeQueries(['getRevision', org_id, project_id, revision_id]);
    queryClient.removeQueries([
      'getRevisionChecks',
      org_id,
      project_id,
      revision_id,
    ]);
  }

  return json;
}
