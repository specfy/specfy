import type {
  GetRevision,
  ListRevisionChecks,
  ListRevisions,
  MergeRevision,
  PatchRevision,
  PostRevision,
  RebaseRevision,
} from '@specfy/models';
import { useQuery } from '@tanstack/react-query';

import { qcli, refreshProject } from '../common/query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export async function createRevision(
  data: PostRevision['Body']
): Promise<PostRevision['Reply']> {
  const { res, json } = await fetchApi<PostRevision>(
    '/revisions',
    { body: data },
    'POST'
  );

  if (res.status === 200) {
    void qcli.invalidateQueries(['listRevisions', data.orgId, data.projectId]);
    void qcli.invalidateQueries(['listActivities', data.orgId]);
  }

  return json;
}

export async function updateRevision(
  { org_id, project_id, revision_id }: PatchRevision['QP'],
  data: PatchRevision['Body']
): Promise<PatchRevision['Reply']> {
  const { res, json } = await fetchApi<PatchRevision>(
    `/revisions/${revision_id}`,
    { body: data, qp: { org_id, project_id } },
    'PATCH'
  );

  if (res.status === 200) {
    void qcli.invalidateQueries(['listRevisions', org_id, project_id]);
    void qcli.invalidateQueries(['listBlobs', org_id, project_id, revision_id]);
    void qcli.invalidateQueries([
      'getRevision',
      org_id,
      project_id,
      revision_id,
    ]);
    void qcli.invalidateQueries([
      'getRevisionChecks',
      org_id,
      project_id,
      revision_id,
    ]);
    void qcli.refetchQueries([
      'listActivities',
      org_id,
      project_id,
      revision_id,
    ]);
  }

  return json;
}

export function useListRevisions(opts: ListRevisions['Querystring']) {
  return useQuery({
    queryKey: [
      'listRevisions',
      opts.org_id,
      opts.project_id,
      opts.status,
      opts.search,
    ],
    queryFn: async (): Promise<ListRevisions['Success']> => {
      const { json, res } = await fetchApi<ListRevisions>('/revisions', {
        qp: opts,
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export function useGetRevision({
  org_id,
  project_id,
  revision_id,
}: GetRevision['QP']) {
  return useQuery({
    enabled: Boolean(revision_id),
    queryKey: ['getRevision', org_id, project_id, revision_id],
    queryFn: async (): Promise<GetRevision['Success']> => {
      const { json, res } = await fetchApi<GetRevision>(
        `/revisions/${revision_id}`,
        {
          qp: { org_id, project_id },
        }
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export async function mergeRevision({
  org_id,
  project_id,
  revision_id,
}: MergeRevision['QP']): Promise<MergeRevision['Reply']> {
  const { json, res } = await fetchApi<MergeRevision>(
    `/revisions/${revision_id}/merge`,
    {
      qp: { org_id, project_id },
    },
    'POST'
  );

  if (res.status === 200) {
    await refreshProject(org_id, project_id);
  } else {
    void qcli.invalidateQueries([
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
}: ListRevisionChecks['Querystring'] & Partial<ListRevisionChecks['Params']>) {
  return useQuery({
    enabled: !!revision_id,
    queryKey: ['getRevisionChecks', org_id, project_id, revision_id],
    queryFn: async (): Promise<ListRevisionChecks['Success']> => {
      const { json, res } = await fetchApi<ListRevisionChecks>(
        `/revisions/${revision_id}/checks`,
        {
          qp: { org_id, project_id },
        }
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export async function rebaseRevision({
  org_id,
  project_id,
  revision_id,
}: RebaseRevision['QP']): Promise<RebaseRevision['Reply']> {
  const { json, res } = await fetchApi<RebaseRevision>(
    `/revisions/${revision_id}/rebase`,
    {
      qp: { org_id, project_id },
    },
    'POST'
  );

  if (res.status === 200) {
    void qcli.invalidateQueries(['listRevisions', org_id, project_id]);
    void qcli.invalidateQueries(['listBlobs', org_id, project_id, revision_id]);
    void qcli.invalidateQueries([
      'getRevision',
      org_id,
      project_id,
      revision_id,
    ]);
    void qcli.invalidateQueries([
      'getRevisionChecks',
      org_id,
      project_id,
      revision_id,
    ]);
  }

  return json;
}
