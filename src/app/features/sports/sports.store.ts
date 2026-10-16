import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { errorMessage } from '../../core/api/error-message';
import { OddsApi } from '../../core/api/odds-api';
import { RequestStatus } from '../../core/models/request-status';
import { Sport } from '../../core/models/sport';

export interface SportGroup {
  name: string;
  sports: Sport[];
}

interface SportsState {
  sports: Sport[];
  status: RequestStatus;
  error: string;
}

const initialState: SportsState = {
  sports: [],
  status: 'idle',
  error: '',
};

export const SportsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ sports }) => ({
    groups: computed(() => groupByGroup(sports())),
  })),
  withMethods((store, api = inject(OddsApi)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { status: 'loading' })),
        switchMap(() =>
          api.getSports().pipe(
            tap((sports) => patchState(store, { sports, status: 'success' })),
            catchError((error: unknown) => {
              patchState(store, { status: 'error', error: errorMessage(error) });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store.load();
    },
  }),
);

function groupByGroup(sports: Sport[]): SportGroup[] {
  const groups = new Map<string, Sport[]>();
  for (const sport of sports) {
    const group = groups.get(sport.group) ?? [];
    group.push(sport);
    groups.set(sport.group, group);
  }
  return [...groups].map(([name, sports]) => ({ name, sports }));
}
