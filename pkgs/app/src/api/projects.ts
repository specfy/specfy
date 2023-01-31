import type {
  ReqListProjects,
  ReqPostProject,
  ReqProjectParams,
  ResGetProject,
  ResListProjects,
  ResPostProject,
} from 'api/src/types/api/projects';
import { useQuery } from 'react-query';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';

export async function createProject(
  data: ReqPostProject
): Promise<ResPostProject> {
  const { json } = await fetchApi<ResPostProject>(
    '/projects',
    { body: data },
    'POST'
  );

  queryClient.removeQueries(['listProjects', data.orgId]);

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

export function useListProjects(opts: ReqListProjects) {
  return useQuery({
    queryKey: ['listProjects', opts.org_id],
    queryFn: async (): Promise<ResListProjects> => {
      const { json } = await fetchApi<ResListProjects, ReqListProjects>(
        '/projects',
        {
          qp: opts,
        }
      );

      return json;
    },
  });
}

export function useGetProject(opts: ReqProjectParams) {
  return useQuery({
    queryKey: ['getProject', opts.org_id, opts.project_slug],
    queryFn: async (): Promise<ResGetProject> => {
      const { json } = await fetchApi<ResGetProject>(
        `/projects/${opts.org_id}/${opts.project_slug}`
      );

      return json;
    },
  });
}
