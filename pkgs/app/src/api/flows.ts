import type { GetFlow, PatchFlow } from '@specfy/models';
import { useQuery } from '@tanstack/react-query';

import { qcli } from '../common/query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useGetFlow({ flow_id, org_id, project_id }: GetFlow['QP']) {
  return useQuery({
    queryKey: ['getFlow', org_id, project_id, flow_id],
    queryFn: async (): Promise<GetFlow['Success']> => {
      const { json, res } = await fetchApi<GetFlow>(`/flows/${flow_id}`, {
        qp: { org_id, project_id },
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export async function updateFlow(
  { flow_id, org_id, project_id }: PatchFlow['QP'],
  data: PatchFlow['Body']
): Promise<PatchFlow['Reply']> {
  const { res, json } = await fetchApi<PatchFlow>(
    `/flows/${flow_id}`,
    { body: data, qp: { org_id, project_id } },
    'PATCH'
  );

  if (res.status === 200) {
    void qcli.invalidateQueries(['getFlow', org_id]);
  }

  return json;
}
