import { useQuery } from 'react-query';

import type { Me } from '../types/me';

export async function getMe(): Promise<Me> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: '1234',
        name: 'Samuel Bodin',
        email: 'bodin.samuel@gmail.com',
        orgs: [
          {
            id: '1234',
            name: "Samuel Bodin's org",
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
          {
            id: '1234',
            name: 'Algolia',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
        ],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });
    }, 250);
  });
}

export function useGetMe() {
  return useQuery({
    queryKey: ['getMe'],
    queryFn: async (): Promise<Me> => {
      return await getMe();
    },
  });
}
