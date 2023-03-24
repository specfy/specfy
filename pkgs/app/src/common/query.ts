import { QueryClient } from 'react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 60 * 1000 * 5,
      retry: false,
    },
  },
});
