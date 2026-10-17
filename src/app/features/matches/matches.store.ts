import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, map, pipe, switchMap, tap } from 'rxjs';
import { errorMessage } from '../../core/api/error-message';
import { OddsApi } from '../../core/api/odds-api';
import { Bookmaker, Match, Odds } from '../../core/models/match';
import { RequestStatus } from '../../core/models/request-status';
import { DEMO_MATCH_COUNT, generateDemoMatches, isDemoMatch } from './demo-matches';

interface MatchesState {
  matches: Match[];
  status: RequestStatus;
  error: string;
  query: string;
  /** `null` = no choice yet, the most common bookmaker is used. */
  bookmakerKey: string | null;
  selectedMatchId: string | null;
  /** Position in the selected match's odds sorted from highest; `null` = nothing highlighted. */
  highlightIndex: number | null;
}

const initialState: MatchesState = {
  matches: [],
  status: 'idle',
  error: '',
  query: '',
  bookmakerKey: null,
  selectedMatchId: null,
  highlightIndex: null,
};

const NO_ODDS: Odds = { home: null, draw: null, away: null };

export const MatchesStore = signalStore(
  withState(initialState),
  withComputed(({ matches, query, bookmakerKey, selectedMatchId, highlightIndex }) => {
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
    const selectedValues = computed(() => {
      const match = matches().find((m) => m.id === selectedMatchId());
      return match ? distinctDescending(oddsOf(match, bookmaker()?.key)) : [];
    });
    const highlightedValue = computed(() => {
      const index = highlightIndex();
      return index === null ? null : (selectedValues().at(index) ?? null);
    });

    return {
      bookmakers,
      bookmaker,
      selectedValues,
      highlightedValue,
      title: computed(() => matches().at(0)?.sportTitle ?? 'Zápasy'),
      rows: computed(() => {
        const key = bookmaker()?.key;
        const lit = highlightedValue();

        return filteredMatches().map((match) => {
          const odds = oddsOf(match, key);
          const selected = match.id === selectedMatchId();
          const cell = (label: string, value: number | null) => ({
            label,
            value,
            highlighted: selected && value !== null && value === lit,
          });

          return {
            match,
            selected,
            demo: isDemoMatch(match),
            cells: [cell('1', odds.home), cell('X', odds.draw), cell('2', odds.away)],
          };
        });
      }),
    };
  }),
  withMethods((store, api = inject(OddsApi)) => ({
    setQuery(query: string): void {
      patchState(store, { query });
    },
    setBookmaker(bookmakerKey: string): void {
      patchState(store, { bookmakerKey, highlightIndex: null });
    },
    selectMatch(matchId: string): void {
      const selectedMatchId = store.selectedMatchId() === matchId ? null : matchId;
      patchState(store, { selectedMatchId, highlightIndex: null });
    },
    nextOdds(): void {
      const count = store.selectedValues().length;
      if (count === 0) {
        return;
      }
      const index = store.highlightIndex();
      patchState(store, { highlightIndex: index === null ? 0 : (index + 1) % count });
    },
    load: rxMethod<{ sportKey: string; demo: boolean }>(
      pipe(
        tap(() => patchState(store, { status: 'loading' })),
        switchMap(({ sportKey, demo }) =>
          api.getMatches(sportKey).pipe(
            map((matches) => (demo ? withDemoMatches(matches, sportKey) : matches)),
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

/** Demo mode: the real API response plus generated matches with the same bookmakers. */
function withDemoMatches(matches: Match[], sportKey: string): Match[] {
  const sportTitle = matches.at(0)?.sportTitle ?? 'Demo';
  const demo = generateDemoMatches(DEMO_MATCH_COUNT, sportKey, sportTitle, allBookmakers(matches));
  return [...matches, ...demo];
}

function oddsOf(match: Match, bookmakerKey: string | undefined): Odds {
  return match.bookmakers.find((b) => b.key === bookmakerKey)?.odds ?? NO_ODDS;
}

/** Available odds without duplicates, highest first: equal odds share one step of "Ďalší kurz". */
function distinctDescending(odds: Odds): number[] {
  const values = [odds.home, odds.draw, odds.away].filter((value) => value !== null);
  return [...new Set(values)].sort((a, b) => b - a);
}

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
