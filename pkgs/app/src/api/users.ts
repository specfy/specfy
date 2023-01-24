import type { ApiMe, ResGetMe } from 'api/src/types/api/me';
import { useQuery } from 'react-query';

export async function getMe(): Promise<ApiMe> {
  const res = await fetch('http://localhost:3000/0/me');
  const json = (await res.json()) as ResGetMe;

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
