import { Service, Signal } from '@angular/core';
import { interval, map, Observable } from 'rxjs';
import { Match, Odds } from '../../core/models/match';
import { randomPrice } from './demo-matches';

const TICK_MS = 2000;
const CHANGES_PER_TICK = 20;
const OUTCOMES: (keyof Odds)[] = ['home', 'draw', 'away'];

export interface OddsChange {
  matchId: string;
  bookmakerKey: string;
  outcome: keyof Odds;
  price: number;
}

/** Simulated live odds: there is no push API, so new prices are generated locally. */
@Service()
export class OddsTicker {
  /**
   * Every 2 s picks 20 random offered odds of the given bookmaker and gives each a new price.
   * Signals are read on every tick, so a new bookmaker or new data apply immediately.
   */
  changes(
    matches: Signal<Match[]>,
    bookmakerKey: Signal<string | undefined>,
  ): Observable<OddsChange[]> {
    return interval(TICK_MS).pipe(
      map(() => pickChanges(matches(), bookmakerKey(), CHANGES_PER_TICK)),
    );
  }
}

function pickChanges(
  matches: Match[],
  bookmakerKey: string | undefined,
  count: number,
): OddsChange[] {
  if (bookmakerKey === undefined) {
    return [];
  }

  // Only odds that exist: a missing draw (basketball) must stay missing.
  const offered: Omit<OddsChange, 'price'>[] = [];
  for (const match of matches) {
    const odds = match.bookmakers.find((b) => b.key === bookmakerKey)?.odds;
    for (const outcome of OUTCOMES) {
      if (odds && odds[outcome] !== null) {
        offered.push({ matchId: match.id, bookmakerKey, outcome });
      }
    }
  }

  // Draw without repetition: take a random item out of the list until we have enough.
  const changes: OddsChange[] = [];
  while (changes.length < count && offered.length > 0) {
    const [picked] = offered.splice(Math.floor(Math.random() * offered.length), 1);
    changes.push({ ...picked, price: randomPrice() });
  }
  return changes;
}
