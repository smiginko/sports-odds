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
  query: string;
  /** `null` = no choice yet, the most common bookmaker is used. */
  bookmakerKey: string | null;
}

const initialState: MatchesState = {
  matches: [],
  status: 'idle',
  error: '',
  query: '',
  bookmakerKey: null,
};

const NO_ODDS: Odds = { home: null, draw: null, away: null };

export const MatchesStore = signalStore(
  withState(initialState),
  withComputed(({ matches, query, bookmakerKey }) => {
    const bookmakers = computed(() => allBookmakers(matches()));
    const bookmaker = computed(
      () => bookmakers().find((b) => b.key === bookmakerKey()) ?? mostCommonBookmaker(matches()),
    );
    const filteredMatches = computed(() => {
      const text = query().trim().toLocaleLowerCase();
      return matches().filter(
        (match) =>
          match.homeTeam.toLocaleLowerCase().includes(text) ||
          match.awayTeam.toLocaleLowerCase().includes(text),
      );
    });

    return {
      bookmakers,
      bookmaker,
      title: computed(() => matches().at(0)?.sportTitle ?? 'Zápasy'),
      rows: computed(() => {
        const key = bookmaker()?.key;
        return filteredMatches().map((match) => ({
          match,
          odds: match.bookmakers.find((b) => b.key === key)?.odds ?? NO_ODDS,
        }));
      }),
    };
  }),
  withMethods((store, api = inject(OddsApi)) => ({
    setQuery(query: string): void {
      patchState(store, { query });
    },
    setBookmaker(bookmakerKey: string): void {
      patchState(store, { bookmakerKey });
    },
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

/** Every bookmaker that offers odds for at least one match, sorted by name. */
function allBookmakers(matches: Match[]): Bookmaker[] {
  const byKey = new Map<string, Bookmaker>();
  for (const match of matches) {
    for (const { key, title } of match.bookmakers) {
      byKey.set(key, { key, title });
    }
  }
  return [...byKey.values()].sort((a, b) => a.title.localeCompare(b.title));
}

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
