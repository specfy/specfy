import type {
  DeleteProject,
  GetProject,
  ListProjects,
  PostProject,
  PutProject,
} from '@specfy/api/src/types/api';
import { useQuery } from '@tanstack/react-query';

import { queryClient } from '../common/query';
import originalStore from '../common/store';

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
    queryClient.refetchQueries(['listProjects', data.orgId]);
    queryClient.refetchQueries(['getFlow', data.orgId]);
  }

  return json;
}

export async function updateProject(
  opts: PutProject['Params'],
  data: PutProject['Body']
): Promise<PutProject['Reply']> {
  const { res, json } = await fetchApi<PutProject>(
    `/projects/${opts.org_id}/${opts.project_slug}`,
    { body: data },
    'PUT'
  );

  if (res.status === 200) {
    void queryClient.invalidateQueries(['listProjects', opts.org_id]);
    void queryClient.invalidateQueries([
      'getProject',
      opts.org_id,
      opts.project_slug,
    ]);
  }

  return json;
}

export async function deleteProject(
  opts: DeleteProject['Params']
): Promise<DeleteProject['Reply']> {
  const { res, json } = await fetchApi<DeleteProject>(
    `/projects/${opts.org_id}/${opts.project_slug}`,
    undefined,
    'DELETE'
  );

  if (res.status === 200) {
    void queryClient.refetchQueries(['listProjects', opts.org_id]);
    void queryClient.invalidateQueries(['getProject', opts.org_id]);
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

export function useGetProject(opts: Partial<GetProject['Params']>) {
  return useQuery({
    enabled: Boolean(opts.org_id),
    queryKey: ['getProject', opts.org_id, opts.project_slug],
    queryFn: async (): Promise<GetProject['Success']> => {
      const { json, res } = await fetchApi<GetProject>(
        `/projects/${opts.org_id}/${opts.project_slug}`
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      } else {
        originalStore.add(json.data);
      }

      return json;
    },
  });
}
