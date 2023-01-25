import type { ApiMe } from 'api/src/types/api/me';
import type {
  ApiProject,
  ReqGetProject,
  ReqProjectParams,
  ResGetProject,
  ResListProjects,
} from 'api/src/types/api/projects';
import { useQuery } from 'react-query';

import { db } from '../common/db';
import { getRandomID, slugify } from '../common/string';

import { fetchApi } from './fetch';

export async function createProject(
  data: Pick<ApiProject, 'description' | 'name' | 'orgId'>,
  { author }: { author: ApiMe }
) {
  const id = getRandomID();
  const slug = slugify(data.name);
  await db.projects.add(
    {
      id,
      orgId: data.orgId,
      name: data.name,
      slug,
      description: data.description,
      author: author.id,
      links: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    id
  );

  return { id, slug };
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
