import { useQuery } from '@tanstack/react-query';

import type { GetJob, ListJobs, PostJob } from '@specfy/models';

import { qcli } from '@/common/query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export async function createJob(
  data: PostJob['Body']
): Promise<PostJob['Reply']> {
  const { res, json } = await fetchApi<PostJob>(
    '/jobs',
    { body: data },
    'POST'
  );

  if (res.status === 200) {
    qcli.refetchQueries(['listJobs', data.orgId, data.projectId]);
  }

  return json;
}

export function useListDeploys(opts: ListJobs['Querystring']) {
  return useQuery({
    queryKey: ['listJobs', opts.org_id, opts.project_id],
    queryFn: async (): Promise<ListJobs['Success']> => {
      const { json, res } = await fetchApi<ListJobs>('/jobs', {
        qp: opts,
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export function useGetDeploy(opts: GetJob['QP']) {
  return useQuery({
    queryKey: ['getJob', opts.org_id, opts.project_id, opts.job_id],
    queryFn: async (): Promise<GetJob['Success']> => {
      const { json, res } = await fetchApi<GetJob>(`/jobs/${opts.job_id}`, {
        qp: { org_id: opts.org_id, project_id: opts.project_id },
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}
