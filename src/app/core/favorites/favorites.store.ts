import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Match } from '../models/match';

const FAVORITES_KEY = 'favorites';

/** A saved match without odds: enough to list it, current odds are on the detail page. */
export type FavoriteMatch = Omit<Match, 'bookmakers'>;

interface FavoritesState {
  favorites: FavoriteMatch[];
}

export const FavoritesStore = signalStore(
  { providedIn: 'root' },
  withState<FavoritesState>({ favorites: [] }),
  withComputed(({ favorites }) => ({
    count: computed(() => favorites().length),
    ids: computed(() => new Set(favorites().map((favorite) => favorite.id))),
    byTime: computed(() =>
      [...favorites()].sort((a, b) => a.commenceTime.localeCompare(b.commenceTime)),
    ),
  })),
  withMethods((store) => ({
    toggle(match: FavoriteMatch): void {
      const favorites = store.ids().has(match.id)
        ? store.favorites().filter((favorite) => favorite.id !== match.id)
        : [...store.favorites(), toFavorite(match)];

      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      patchState(store, { favorites });
    },
  })),
  withHooks({
    onInit(store) {
      patchState(store, { favorites: readFavorites() });
    },
  }),
);

/** Copies only the listed fields, so a full `Match` is saved without its bookmakers. */
function toFavorite({
  id,
  sportKey,
  sportTitle,
  commenceTime,
  homeTeam,
  awayTeam,
}: FavoriteMatch): FavoriteMatch {
  return { id, sportKey, sportTitle, commenceTime, homeTeam, awayTeam };
}

function readFavorites(): FavoriteMatch[] {
  try {
    const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    // Corrupted value in localStorage: start with an empty list instead of crashing.
    return [];
  }
}
