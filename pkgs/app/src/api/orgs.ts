import type { ApiOrg, ResListOrgs } from 'api/src/types/api/orgs';
import { useQuery } from 'react-query';

export async function listOrgs(): Promise<ApiOrg[]> {
  const res = await fetch('http://localhost:3000/0/orgs');
  const json = (await res.json()) as ResListOrgs;

  return json.data;
}

export function useListOrgs() {
  return useQuery({
    queryKey: ['listOrgs'],
    queryFn: async (): Promise<ApiOrg[]> => {
      return await listOrgs();
    },
  });
}
