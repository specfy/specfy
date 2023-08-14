import type {
  CancelSubscription,
  GetBillingUsage,
  GetSubscription,
  PostSubscription,
} from '@specfy/models';
import { useQuery } from '@tanstack/react-query';

import { qcli } from '../common/query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useGetUsage(params: GetBillingUsage['Params']) {
  return useQuery({
    queryKey: ['getUsage', params.org_id],
    queryFn: async (): Promise<GetBillingUsage['Success']> => {
      const { json, res } = await fetchApi<GetBillingUsage>(
        `/stripe/${params.org_id}/usage`
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export function useGetSubscription(params: GetSubscription['Params']) {
  return useQuery({
    queryKey: ['getSubscription', params.org_id],
    queryFn: async (): Promise<GetSubscription['Success']> => {
      const { json, res } = await fetchApi<GetSubscription>(
        `/stripe/${params.org_id}/subscription`
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export async function createSubscription(
  params: PostSubscription['Params'],
  data: PostSubscription['Body']
): Promise<PostSubscription['Reply']> {
  const { json } = await fetchApi<PostSubscription>(
    `/stripe/${params.org_id}/subscription`,
    { body: data },
    'POST'
  );

  return json;
}

export async function cancelSubscription(
  params: CancelSubscription['Params'],
  data: CancelSubscription['Body']
): Promise<CancelSubscription['Reply']> {
  const { res, json } = await fetchApi<CancelSubscription>(
    `/stripe/${params.org_id}/subscription`,
    { body: data },
    'DELETE'
  );

  if (res.status === 204) {
    void qcli.refetchQueries(['getSubscription', params.org_id]);
    void qcli.refetchQueries(['getUsage', params.org_id]);
  }

  return json;
}
