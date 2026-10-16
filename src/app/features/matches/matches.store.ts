import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { errorMessage } from '../../core/api/error-message';
import { OddsApi } from '../../core/api/odds-api';
import { Bookmaker, Match, Odds } from '../../core/models/match';
import { RequestStatus } from '../../core/models/request-status';

interface MatchesState {
  matches: Match[];
  status: RequestStatus;
  error: string;
}

const initialState: MatchesState = {
  matches: [],
  status: 'idle',
  error: '',
};

const NO_ODDS: Odds = { home: null, draw: null, away: null };

export const MatchesStore = signalStore(
  withState(initialState),
  withComputed(({ matches }) => {
    const bookmaker = computed(() => mostCommonBookmaker(matches()));

    return {
      bookmaker,
      title: computed(() => matches().at(0)?.sportTitle ?? 'Zápasy'),
      rows: computed(() => {
        const key = bookmaker()?.key;
        return matches().map((match) => ({
          match,
          odds: match.bookmakers.find((b) => b.key === key)?.odds ?? NO_ODDS,
        }));
      }),
    };
  }),
  withMethods((store, api = inject(OddsApi)) => ({
    load: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { status: 'loading' })),
        switchMap((sportKey) =>
          api.getMatches(sportKey).pipe(
            tap((matches) => patchState(store, { matches, status: 'success' })),
            catchError((error: unknown) => {
              patchState(store, { status: 'error', error: errorMessage(error) });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
  })),
);

/** The bookmaker with odds for the most matches, so the list shows the fewest dashes. */
function mostCommonBookmaker(matches: Match[]): Bookmaker | undefined {
  const counts = new Map<string, number>();
  let best: Bookmaker | undefined;
  let bestCount = 0;

  for (const match of matches) {
    for (const { key, title } of match.bookmakers) {
      const count = (counts.get(key) ?? 0) + 1;
      counts.set(key, count);
      if (count > bestCount) {
        best = { key, title };
        bestCount = count;
      }
    }
  }
  return best;
}
