import type {
  ReqListComponents,
  ResListComponents,
} from 'api/src/types/api/components';
import { useQuery } from 'react-query';

import { fetchApi } from './fetch';

export function useListComponents(
  slug: string,
  opts: Partial<ReqListComponents>
) {
  return useQuery({
    enabled: !!(opts.org_id && opts.project_id),
    queryKey: ['listComponents', opts.org_id, slug],
    queryFn: async (): Promise<ResListComponents> => {
      const { json } = await fetchApi<
        ResListComponents,
        Partial<ReqListComponents>
      >('/components', {
        qp: opts,
      });

      return json;
    },
  });
}
