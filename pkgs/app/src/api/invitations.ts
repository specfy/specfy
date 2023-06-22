import { useQuery } from '@tanstack/react-query';
import type {
  AcceptInvitation,
  DeclineInvitation,
  GetInvitation,
  ListInvitations,
  PostInvitation,
} from 'api/src/types/api';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export async function createInvitation(
  data: PostInvitation['Body']
): Promise<PostInvitation['Reply']> {
  const { res, json } = await fetchApi<PostInvitation>(
    '/invitations',
    { body: data },
    'POST'
  );

  if (res.status === 200) {
    queryClient.invalidateQueries(['listInvitations'], { exact: false });
  }

  return json;
}

export async function acceptInvitations(
  opts: AcceptInvitation['QP']
): Promise<AcceptInvitation['Reply']> {
  const { res, json } = await fetchApi<AcceptInvitation>(
    `/invitations/${opts.invitation_id}/accept`,
    { qp: { token: opts.token } },
    'POST'
  );

  if (res.status === 200) {
    queryClient.invalidateQueries(['listInvitations']);
    queryClient.invalidateQueries(['listOrgs']);
    queryClient.invalidateQueries(['listProjects']);
  }

  return json;
}

export async function declineInvitations(
  opts: DeclineInvitation['QP']
): Promise<DeclineInvitation['Reply']> {
  const { res, json } = await fetchApi<DeclineInvitation>(
    `/invitations/${opts.invitation_id}/decline`,
    { qp: { token: opts.token } },
    'POST'
  );

  if (res.status === 200) {
    queryClient.invalidateQueries(['listInvitations']);
  }

  return json;
}

export async function deleteInvitations(
  opts: DeclineInvitation['Params']
): Promise<DeclineInvitation['Reply']> {
  const { res, json } = await fetchApi<DeclineInvitation>(
    `/invitations/${opts.invitation_id}`,
    undefined,
    'DELETE'
  );

  if (res.status === 204) {
    queryClient.invalidateQueries(['listInvitations']);
  }

  return json;
}

export function useListInvitations(
  opts: Partial<ListInvitations['Querystring']>
) {
  return useQuery({
    enabled: Boolean(opts.org_id),
    queryKey: ['listInvitations', opts.org_id],
    queryFn: async (): Promise<ListInvitations['Success']> => {
      const { json, res } = await fetchApi<ListInvitations>('/invitations', {
        qp: { org_id: opts.org_id! },
      });
      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export function useGetInvitation(opts: Partial<GetInvitation['QP']>) {
  return useQuery({
    enabled: Boolean(opts.invitation_id && opts.token),
    queryKey: ['getInvitation', opts.invitation_id],
    queryFn: async (): Promise<GetInvitation['Success']> => {
      const { json, res } = await fetchApi<GetInvitation>(
        `/invitations/${opts.invitation_id}`,
        {
          qp: { token: opts.token! },
        }
      );
      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}
