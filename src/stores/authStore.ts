import { makeAutoObservable } from 'mobx';

import { getUserId } from '@/src/api/http';

/**
 * Session / auth — user id comes from env (Bearer UUID for test API).
 */
export class AuthStore {
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get userId(): string {
    return getUserId();
  }
}

export const authStore = new AuthStore();
