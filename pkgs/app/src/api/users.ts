import { useQuery } from 'react-query';

import { db } from '../common/db';
import type { ApiMe } from '../types/api/me';

export async function getMe(): Promise<ApiMe> {
  const me = (await db.users.get('1234'))!;
  return {
    ...me,
    orgs: [
      {
        id: '1234',
        name: "Samuel Bodin's org",
      },
      {
        id: '6789',
        name: 'Algolia',
      },
    ],
  };
}

export function useGetMe() {
  return useQuery({
    queryKey: ['getMe'],
    queryFn: async (): Promise<ApiMe> => {
      return await getMe();
    },
  });
}
