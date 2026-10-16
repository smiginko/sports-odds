import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

const EMAIL_KEY = 'email';

interface AuthState {
  email: string | null;
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({ email: null }),
  withComputed(({ email }) => ({
    isLoggedIn: computed(() => email() !== null),
  })),
  withMethods((store) => ({
    login(email: string): void {
      localStorage.setItem(EMAIL_KEY, email);
      patchState(store, { email });
    },
    logout(): void {
      localStorage.removeItem(EMAIL_KEY);
      patchState(store, { email: null });
    },
  })),
  withHooks({
    onInit(store) {
      patchState(store, { email: localStorage.getItem(EMAIL_KEY) });
    },
  }),
);
