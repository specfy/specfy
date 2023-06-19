import { useQuery } from '@tanstack/react-query';
import type {
  ReqGetInvitation,
  ReqInvitationParams,
  ReqListInvitations,
  ReqPostInvitations,
  ResAcceptInvitation,
  ResDeclineInvitation,
  ResDeleteInvitation,
  ResGetInvitation,
  ResGetInvitationSuccess,
  ResListInvitations,
  ResListInvitationsSuccess,
  ResPostInvitations,
} from 'api/src/types/api';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export async function createInvitation(
  data: ReqPostInvitations
): Promise<ResPostInvitations> {
  const { json } = await fetchApi<
    ResPostInvitations,
    undefined,
    ReqPostInvitations
  >('/invitations', { body: data }, 'POST');

  queryClient.invalidateQueries(['listInvitations', data.orgId]);

  return json;
}

export async function acceptInvitations(
  opts: ReqGetInvitation & ReqInvitationParams
): Promise<ResAcceptInvitation> {
  const { json } = await fetchApi<ResAcceptInvitation, ReqGetInvitation>(
    `/invitations/${opts.invitation_id}/accept`,
    { qp: { token: opts.token } },
    'POST'
  );

  queryClient.invalidateQueries(['listInvitations']);
  queryClient.invalidateQueries(['listOrgs']);
  queryClient.invalidateQueries(['listProjects']);

  return json;
}

export async function declineInvitations(
  opts: ReqGetInvitation & ReqInvitationParams
): Promise<ResDeclineInvitation> {
  const { json } = await fetchApi<ResDeclineInvitation, ReqGetInvitation>(
    `/invitations/${opts.invitation_id}/decline`,
    { qp: { token: opts.token } },
    'POST'
  );

  queryClient.invalidateQueries(['listInvitations']);

  return json;
}

export async function deleteInvitations(
  opts: ReqInvitationParams
): Promise<ResDeleteInvitation> {
  const { json } = await fetchApi<ResDeleteInvitation, ReqGetInvitation>(
    `/invitations/${opts.invitation_id}`,
    undefined,
    'DELETE'
  );

  queryClient.invalidateQueries(['listInvitations']);

  return json;
}

export function useListInvitations(opts: Partial<ReqListInvitations>) {
  return useQuery({
    enabled: Boolean(opts.org_id),
    queryKey: ['listInvitations', opts.org_id],
    queryFn: async (): Promise<ResListInvitationsSuccess> => {
      const { json, res } = await fetchApi<
        ResListInvitations,
        ReqListInvitations
      >('/invitations', {
        qp: opts as ReqListInvitations,
      });
      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export function useGetInvitation(
  opts: Partial<ReqGetInvitation & ReqInvitationParams>
) {
  return useQuery({
    enabled: Boolean(opts.invitation_id && opts.token),
    queryKey: ['getInvitation', opts.invitation_id],
    queryFn: async (): Promise<ResGetInvitationSuccess> => {
      const { json, res } = await fetchApi<ResGetInvitation, ReqGetInvitation>(
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
