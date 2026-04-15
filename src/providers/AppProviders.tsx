import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RealtimeSync } from '@/src/realtime/RealtimeSync';
import { AuthStoreProvider } from '@/src/stores/authContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthStoreProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <RealtimeSync />
          {children}
        </SafeAreaProvider>
      </QueryClientProvider>
    </AuthStoreProvider>
  );
}

export { queryClient };
