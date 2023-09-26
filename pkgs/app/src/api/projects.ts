import { useQuery } from '@tanstack/react-query';

import type {
  DeleteProject,
  GetProject,
  GetProjectBySlug,
  ListProjects,
  PostProject,
  PutProject,
} from '@specfy/models';

import { qcli } from '@/common/query';
import { original } from '@/common/store';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export async function createProject(
  data: PostProject['Body']
): Promise<PostProject['Reply']> {
  const { res, json } = await fetchApi<PostProject>(
    '/projects',
    { body: data },
    'POST'
  );

  if (res.status === 200) {
    qcli.refetchQueries(['listProjects', data.orgId]);
    qcli.refetchQueries(['getFlow', data.orgId]);
  }

  return json;
}

export async function updateProject(
  opts: PutProject['QP'],
  data: PutProject['Body']
): Promise<PutProject['Reply']> {
  const { res, json } = await fetchApi<PutProject>(
    `/projects/${opts.project_id}`,
    { body: data, qp: { org_id: opts.org_id } },
    'PUT'
  );

  if (res.status === 200) {
    void qcli.invalidateQueries(['listProjects', opts.org_id]);
    void qcli.invalidateQueries(['getProject', opts.org_id]);
  }

  return json;
}

export async function deleteProject(
  opts: DeleteProject['QP']
): Promise<DeleteProject['Reply']> {
  const { res, json } = await fetchApi<DeleteProject>(
    `/projects/${opts.project_id}`,
    { qp: { org_id: opts.org_id } },
    'DELETE'
  );

  if (res.status === 204) {
    void qcli.invalidateQueries(['listProjects', opts.org_id]);
    void qcli.invalidateQueries(['getProject', opts.org_id]);
    void qcli.invalidateQueries(['getFlow', opts.org_id]);
  }

  return json;
}

export function useListProjects(opts: Partial<ListProjects['Querystring']>) {
  return useQuery({
    enabled: Boolean(opts.org_id),
    queryKey: ['listProjects', opts.org_id],
    queryFn: async (): Promise<ListProjects['Success']> => {
      const { json, res } = await fetchApi<ListProjects>('/projects', {
        qp: { org_id: opts.org_id! },
      });
      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export function useGetProject(opts: Partial<GetProject['QP']>) {
  return useQuery({
    enabled: Boolean(opts.org_id),
    queryKey: ['getProject', opts.org_id, opts.project_id],
    queryFn: async (): Promise<GetProject['Success']> => {
      const { json, res } = await fetchApi<GetProject>(
        `/projects/${opts.project_id}`,
        { qp: { org_id: opts.org_id! } }
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      } else {
        original.add(json.data);
      }

      return json;
    },
  });
}

export function useGetProjectBySlug(
  opts: Partial<GetProjectBySlug['Querystring']>
) {
  return useQuery({
    enabled: Boolean(opts.org_id),
    queryKey: ['getProject', opts.org_id, opts.slug],
    queryFn: async (): Promise<GetProjectBySlug['Success']> => {
      const { json, res } = await fetchApi<GetProjectBySlug>(
        `/projects/by_slug`,
        {
          qp: { org_id: opts.org_id!, slug: opts.slug! },
        }
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      } else {
        original.add(json.data);
      }

      return json;
    },
  });
}
