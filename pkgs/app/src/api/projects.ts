import { useQuery } from '@tanstack/react-query';
import type {
  ReqListProjects,
  ReqPostProject,
  ReqProjectParams,
  ReqPutProject,
  ResDeleteProject,
  ResGetProject,
  ResGetProjectSuccess,
  ResListProjects,
  ResListProjectsSuccess,
  ResPostProject,
  ResPutProject,
} from 'api/src/types/api';

import { queryClient } from '../common/query';
import originalStore from '../common/store';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export async function createProject(
  data: ReqPostProject
): Promise<ResPostProject> {
  const { res, json } = await fetchApi<
    ResPostProject,
    undefined,
    ReqPostProject
  >('/projects', { body: data }, 'POST');

  if (res.status === 200) {
    queryClient.refetchQueries(['listProjects', data.orgId]);
  }

  return json;
}

export async function updateProject(
  opts: ReqProjectParams,
  data: ReqPutProject
): Promise<ResPutProject> {
  const { res, json } = await fetchApi<ResPutProject, undefined, ReqPutProject>(
    `/projects/${opts.org_id}/${opts.project_slug}`,
    { body: data },
    'PUT'
  );

  if (res.status === 200) {
    queryClient.removeQueries(['listProjects', opts.org_id]);
    queryClient.removeQueries(['getProject', opts.org_id, opts.project_slug]);
  }

  return json;
}

export async function deleteProject(
  opts: ReqProjectParams
): Promise<ResDeleteProject> {
  const { res, json } = await fetchApi<ResDeleteProject>(
    `/projects/${opts.org_id}/${opts.project_slug}`,
    undefined,
    'DELETE'
  );

  if (res.status === 200) {
    queryClient.removeQueries(['listProjects', opts.org_id]);
    queryClient.removeQueries(['getProject', opts.org_id, opts.project_slug]);
  }

  return json;
}

export function useListProjects(opts: Partial<ReqListProjects>) {
  return useQuery({
    enabled: Boolean(opts.org_id),
    queryKey: ['listProjects', opts.org_id],
    queryFn: async (): Promise<ResListProjectsSuccess> => {
      const { json, res } = await fetchApi<ResListProjects, ReqListProjects>(
        '/projects',
        {
          qp: opts as ReqListProjects,
        }
      );
      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export function useGetProject(opts: Partial<ReqProjectParams>) {
  return useQuery({
    enabled: Boolean(opts.org_id),
    queryKey: ['getProject', opts.org_id, opts.project_slug],
    queryFn: async (): Promise<ResGetProjectSuccess> => {
      const { json, res } = await fetchApi<ResGetProject>(
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
