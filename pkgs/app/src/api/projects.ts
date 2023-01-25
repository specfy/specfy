import type {
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
    `/projects/${opts.orgId}/${opts.slug}`,
    undefined,
    'DELETE'
  );

  queryClient.removeQueries(['listProjects', opts.orgId]);
  queryClient.removeQueries(['getProject', opts.orgId, opts.slug]);

  return json;
}

export function useListProjects(orgId: string) {
  return useQuery({
    queryKey: ['listProjects', orgId],
    queryFn: async (): Promise<ResListProjects> => {
      const { json } = await fetchApi<ResListProjects>('/projects', {
        qp: { org_id: orgId },
      });

      return json;
    },
  });
}

export function useGetProject(opts: ReqProjectParams) {
  return useQuery({
    queryKey: ['getProject', opts.orgId, opts.slug],
    queryFn: async (): Promise<ResGetProject> => {
      const { json } = await fetchApi<ResGetProject>(
        `/projects/${opts.orgId}/${opts.slug}`
      );

      return json;
    },
  });
}
