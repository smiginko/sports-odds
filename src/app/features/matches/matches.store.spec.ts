import { TestBed } from '@angular/core/testing';
import { NEVER, of, Subject } from 'rxjs';
import { OddsApi } from '../../core/api/odds-api';
import { BookmakerOdds, Match } from '../../core/models/match';
import { MatchesStore } from './matches.store';
import { OddsTicker } from './odds-ticker';

function bookmaker(key: string, home: number, draw: number | null, away: number): BookmakerOdds {
  return { key, title: key.toUpperCase(), odds: { home, draw, away } };
}

function match(id: string, homeTeam: string, awayTeam: string, bookmakers: BookmakerOdds[]): Match {
  return {
    id,
    sportKey: 'soccer_epl',
    sportTitle: 'EPL',
    commenceTime: '2026-10-18T14:00:00Z',
    homeTeam,
    awayTeam,
    bookmakers,
  };
}

describe('MatchesStore', () => {
  const api = { getMatches: vi.fn() };
  let store: InstanceType<typeof MatchesStore>;

  beforeEach(() => {
    api.getMatches.mockReset();
    TestBed.configureTestingModule({
      providers: [
        MatchesStore,
        { provide: OddsApi, useValue: api },
        // No live updates during tests: the ticker never emits.
        { provide: OddsTicker, useValue: { changes: () => NEVER } },
      ],
    });
    store = TestBed.inject(MatchesStore);
  });

  it('ignores an older response when the competition changes quickly', () => {
    const epl = new Subject<Match[]>();
    const nba = new Subject<Match[]>();
    api.getMatches.mockImplementation((sportKey: string) => (sportKey === 'epl' ? epl : nba));
    const eplMatch = match('epl-1', 'Arsenal', 'Chelsea', []);
    const nbaMatch = match('nba-1', 'Lakers', 'Celtics', []);

    store.load({ sportKey: 'epl', demo: false });
    store.load({ sportKey: 'nba', demo: false }); // the user switched before EPL answered
    nba.next([nbaMatch]);
    epl.next([eplMatch]); // the slow, older response arrives last

    expect(store.matches()).toEqual([nbaMatch]);
    expect(store.status()).toBe('success');
  });

  it('filters rows by team name, ignoring letter case', () => {
    api.getMatches.mockReturnValue(
      of([
        match('m1', 'Arsenal', 'Everton', []),
        match('m2', 'Chelsea', 'Fulham', []),
        match('m3', 'Brighton', 'Arsenal', []),
      ]),
    );
    store.load({ sportKey: 'epl', demo: false });

    store.setQuery('ARSEN');

    expect(store.rows().map((row) => row.match.id)).toEqual(['m1', 'm3']);
  });

  it('shows odds of the bookmaker that covers the most matches by default', () => {
    api.getMatches.mockReturnValue(
      of([
        match('m1', 'Arsenal', 'Everton', [bookmaker('a', 2, 3, 4), bookmaker('b', 2, 3, 4)]),
        match('m2', 'Chelsea', 'Fulham', [bookmaker('b', 1.5, 4, 6)]),
      ]),
    );

    store.load({ sportKey: 'epl', demo: false });

    expect(store.bookmaker()?.key).toBe('b');
  });

  it('highlights the odds from highest to lowest, equal odds together, then starts again', () => {
    api.getMatches.mockReturnValue(
      of([match('m1', 'Bournemouth', 'Sunderland', [bookmaker('b', 2.15, 3.63, 3.63)])]),
    );
    store.load({ sportKey: 'epl', demo: false });
    const highlighted = () =>
      store
        .rows()[0]
        .cells.filter((cell) => cell.highlighted)
        .map((cell) => cell.label);

    store.selectMatch('m1');

    store.nextOdds();
    expect(highlighted()).toEqual(['X', '2']);
    store.nextOdds();
    expect(highlighted()).toEqual(['1']);
    store.nextOdds();
    expect(highlighted()).toEqual(['X', '2']);
  });
});
