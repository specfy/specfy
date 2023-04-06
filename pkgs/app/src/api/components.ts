import { useQuery } from '@tanstack/react-query';
import type {
  ApiComponent,
  ReqListComponents,
  ResListComponents,
} from 'api/src/types/api';

import originalStore from '../common/store';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useListComponents(
  slug: string,
  opts: Partial<ReqListComponents>
) {
  return useQuery({
    enabled: !!(opts.org_id && opts.project_id),
    queryKey: ['listComponents', opts.org_id, slug],
    queryFn: async (): Promise<ApiComponent[]> => {
      const { json, res } = await fetchApi<
        ResListComponents,
        Partial<ReqListComponents>
      >('/components', {
        qp: opts,
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json.data.map((component) => {
        originalStore.add(component);
        return component;
      });
    },
  });
}
