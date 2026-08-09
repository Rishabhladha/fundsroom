import { QueryClient } from '@tanstack/react-query';

// Single QueryClient instance shared across the app
// staleTime: 30s — avoids refetching on every component mount
// retry: 1 — retry once on network errors, not on 4xx

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (bad request, unauthorized, etc.)
        if (error?.statusCode >= 400 && error?.statusCode < 500) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
