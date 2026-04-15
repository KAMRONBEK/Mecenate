import { createContext, useContext, type ReactNode } from 'react';

import { authStore, AuthStore } from '@/src/stores/authStore';

const AuthStoreContext = createContext<AuthStore>(authStore);

export function AuthStoreProvider({ children }: { children: ReactNode }) {
  return <AuthStoreContext.Provider value={authStore}>{children}</AuthStoreContext.Provider>;
}

export function useAuthStore(): AuthStore {
  return useContext(AuthStoreContext);
}
