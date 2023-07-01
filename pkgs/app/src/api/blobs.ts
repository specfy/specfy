import type { ListRevisionBlobs } from '@specfy/api/src/types/api';
import { useQuery } from '@tanstack/react-query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useListRevisionBlobs({
  org_id,
  project_id,
  revision_id,
}: ListRevisionBlobs['Querystring'] & Partial<ListRevisionBlobs['Params']>) {
  return useQuery({
    enabled: !!revision_id,
    queryKey: ['listBlobs', org_id, project_id, revision_id],
    queryFn: async (): Promise<ListRevisionBlobs['Success']> => {
      const { json, res } = await fetchApi<ListRevisionBlobs>(
        `/revisions/${revision_id}/blobs`,
        {
          qp: { org_id, project_id },
        }
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}
