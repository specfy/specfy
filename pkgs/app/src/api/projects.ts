import type {
  ReqGetProject,
  ReqPostProject,
  ReqProjectParams,
  ResGetProject,
  ResListProjects,
  ResPostProject,
} from 'api/src/types/api/projects';
import { useQuery } from 'react-query';

import { fetchApi } from './fetch';

export async function createProject(
  data: ReqPostProject
): Promise<ResPostProject> {
  const { json } = await fetchApi<ResPostProject>(
    '/projects',
    { body: data },
    'POST'
  );

  return json;
}

export function useListProjects(orgId: string) {
  return useQuery({
    queryKey: ['listProjects', orgId],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryFn: async (): Promise<ResListProjects> => {
      const { json } = await fetchApi<ResListProjects>('/projects', {
        qp: { org_id: orgId },
      });

      return json;
    },
  });
}

export function useGetProject(opts: ReqGetProject & ReqProjectParams) {
  return useQuery({
    queryKey: ['getProject', opts.org_id, opts.slug],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryFn: async (): Promise<ResGetProject> => {
      const { json } = await fetchApi<ResGetProject>(`/projects/${opts.slug}`, {
        qp: { org_id: opts.org_id },
      });

      return json;
    },
  });
}
