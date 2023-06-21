import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 60 * 1000 * 5,
      retry: false,
    },
  },
});
