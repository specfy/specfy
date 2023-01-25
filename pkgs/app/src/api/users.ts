import type { ApiMe, ResGetMe } from 'api/src/types/api/me';
import { useQuery } from 'react-query';

import { fetchApi } from './fetch';

export async function getMe(): Promise<ApiMe> {
  const { json } = await fetchApi<ResGetMe>('/me');

  return json.data;
}

export function useGetMe() {
  return useQuery({
    queryKey: ['getMe'],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryFn: async (): Promise<ApiMe> => {
      return await getMe();
    },
  });
}
