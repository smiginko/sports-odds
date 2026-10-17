import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { errorMessage } from '../../core/api/error-message';
import { OddsApi } from '../../core/api/odds-api';
import { BookmakerOdds, Match, Odds } from '../../core/models/match';
import { RequestStatus } from '../../core/models/request-status';

interface MatchDetailState {
  match: Match | null;
  status: RequestStatus;
  error: string;
}

const initialState: MatchDetailState = {
  match: null,
  status: 'idle',
  error: '',
};

export const MatchDetailStore = signalStore(
  withState(initialState),
  withComputed(({ match }) => ({
    rows: computed(() => {
      const bookmakers = [...(match()?.bookmakers ?? [])].sort((a, b) =>
        a.title.localeCompare(b.title),
      );
      const best = bestOdds(bookmakers);
      const cell = (value: number | null, bestValue: number | null) => ({
        value,
        best: value !== null && value === bestValue,
      });

      return bookmakers.map(({ key, title, odds }) => ({
        key,
        title,
        cells: [cell(odds.home, best.home), cell(odds.draw, best.draw), cell(odds.away, best.away)],
      }));
    }),
  })),
  withMethods((store, api = inject(OddsApi)) => ({
    load: rxMethod<{ sportKey: string; eventId: string }>(
      pipe(
        tap(() => patchState(store, { status: 'loading' })),
        switchMap(({ sportKey, eventId }) =>
          api.getMatch(sportKey, eventId).pipe(
            tap((match) => patchState(store, { match, status: 'success' })),
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

/** The highest offered odds for 1, X and 2 across all bookmakers. */
function bestOdds(bookmakers: BookmakerOdds[]): Odds {
  const highest = (values: (number | null)[]) => {
    const offered = values.filter((value) => value !== null);
    return offered.length > 0 ? Math.max(...offered) : null;
  };

  return {
    home: highest(bookmakers.map((b) => b.odds.home)),
    draw: highest(bookmakers.map((b) => b.odds.draw)),
    away: highest(bookmakers.map((b) => b.odds.away)),
  };
}
