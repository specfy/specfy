import { useQuery } from '@tanstack/react-query';
import type {
  ReqListProjects,
  ReqPostProject,
  ReqProjectParams,
  ReqUpdateProject,
  ResGetProject,
  ResListProjects,
  ResPostProject,
  ResUpdateProject,
} from 'api/src/types/api';

import { queryClient } from '../common/query';
import originalStore from '../common/store';

import { fetchApi } from './fetch';

export async function createProject(
  data: ReqPostProject
): Promise<ResPostProject> {
  const { json } = await fetchApi<ResPostProject, undefined, ReqPostProject>(
    '/projects',
    { body: data },
    'POST'
  );

  queryClient.removeQueries(['listProjects', data.orgId]);

  return json;
}

export async function updateProject(
  opts: ReqProjectParams,
  data: ReqUpdateProject
) {
  const { json } = await fetchApi<
    ResUpdateProject,
    undefined,
    ReqUpdateProject
  >(`/projects/${opts.org_id}/${opts.project_slug}`, { body: data }, 'PUT');

  queryClient.removeQueries(['listProjects', opts.org_id]);
  queryClient.removeQueries(['getProject', opts.org_id, opts.project_slug]);

  return json;
}

export async function deleteProject(opts: ReqProjectParams) {
  const { json } = await fetchApi<ResPostProject>(
    `/projects/${opts.org_id}/${opts.project_slug}`,
    undefined,
    'DELETE'
  );

  queryClient.removeQueries(['listProjects', opts.org_id]);
  queryClient.removeQueries(['getProject', opts.org_id, opts.project_slug]);

  return json;
}

export function useListProjects(opts: Partial<ReqListProjects>) {
  return useQuery({
    enabled: Boolean(opts.org_id),
    queryKey: ['listProjects', opts.org_id],
    queryFn: async (): Promise<ResListProjects> => {
      const { json } = await fetchApi<ResListProjects, ReqListProjects>(
        '/projects',
        {
          qp: opts as ReqListProjects,
        }
      );

      return json;
    },
  });
}

export function useGetProject(opts: Partial<ReqProjectParams>) {
  return useQuery({
    enabled: Boolean(opts.org_id),
    queryKey: ['getProject', opts.org_id, opts.project_slug],
    queryFn: async (ctx): Promise<ResGetProject> => {
      const { json, res } = await fetchApi<ResGetProject>(
        `/projects/${opts.org_id}/${opts.project_slug}`
      );

      if (res.status === 200) {
        originalStore.add(json.data);
      } else {
        throw new Error('err', { cause: res });
      }

      return json;
    },
  });
}
