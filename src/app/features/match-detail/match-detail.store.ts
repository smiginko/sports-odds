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

/** The highest price for one outcome and the bookmaker that offers it. */
interface BestPrice {
  value: number;
  bookmaker: string;
}

export const MatchDetailStore = signalStore(
  withState(initialState),
  withComputed(({ match }) => {
    const bookmakers = computed(() =>
      [...(match()?.bookmakers ?? [])].sort((a, b) => a.title.localeCompare(b.title)),
    );
    const best = computed(() => bestOdds(bookmakers()));

    return {
      rows: computed(() => {
        const cell = (value: number | null, bestPrice: BestPrice | null) => ({
          value,
          best: value !== null && value === bestPrice?.value,
        });
        const { home, draw, away } = best();

        return bookmakers().map(({ key, title, odds }) => ({
          key,
          title,
          cells: [cell(odds.home, home), cell(odds.draw, draw), cell(odds.away, away)],
        }));
      }),
      /** The three "best odds" cards above the table. */
      bestCards: computed(() => {
        const current = match();
        if (!current) {
          return [];
        }
        const { home, draw, away } = best();
        return [
          { label: `1 · ${current.homeTeam}`, price: home },
          { label: 'X · Remíza', price: draw },
          { label: `2 · ${current.awayTeam}`, price: away },
        ];
      }),
    };
  }),
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

/**
 * The highest offered price for 1, X and 2 across all bookmakers, `null` when nobody offers it.
 * On a tie the first bookmaker in the list wins (only `>` replaces the current best).
 */
function bestOdds(bookmakers: BookmakerOdds[]): Record<keyof Odds, BestPrice | null> {
  const highest = (outcome: keyof Odds) => {
    let best: BestPrice | null = null;
    for (const { title, odds } of bookmakers) {
      const value = odds[outcome];
      if (value !== null && (best === null || value > best.value)) {
        best = { value, bookmaker: title };
      }
    }
    return best;
  };

  return { home: highest('home'), draw: highest('draw'), away: highest('away') };
}
