import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Match } from '../models/match';
import { Sport } from '../models/sport';
import { OddsApi } from './odds-api';
import { EventDto, SportDto } from './odds-api.dto';

describe('OddsApi', () => {
  let api: OddsApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(OddsApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('maps 1 / X / 2 by team name, whatever order the API sends them in', () => {
    // Real response shape: the away team came first in the live API.
    const event: EventDto = {
      id: 'e1',
      sport_key: 'soccer_epl',
      sport_title: 'EPL',
      commence_time: '2026-10-17T11:30:00Z',
      home_team: 'Everton',
      away_team: 'Chelsea',
      bookmakers: [
        {
          key: 'unibet_eu',
          title: 'Unibet',
          markets: [
            {
              key: 'h2h',
              outcomes: [
                { name: 'Chelsea', price: 2.05 },
                { name: 'Everton', price: 2.95 },
                { name: 'Draw', price: 3.6 },
              ],
            },
          ],
        },
      ],
    };
    let matches: Match[] = [];

    api.getMatches('soccer_epl').subscribe((result) => (matches = result));
    const request = http.expectOne((req) => req.url === '/api/v4/sports/soccer_epl/odds');
    request.flush([event]);

    expect(request.request.params.get('markets')).toBe('h2h');
    expect(matches[0].homeTeam).toBe('Everton');
    expect(matches[0].bookmakers[0].odds).toEqual({ home: 2.95, draw: 3.6, away: 2.05 });
  });

  it('turns a missing draw into null and ignores the h2h_lay market of exchanges', () => {
    const event: EventDto = {
      id: 'e2',
      sport_key: 'basketball_nba',
      sport_title: 'NBA',
      commence_time: '2026-10-20T23:30:00Z',
      home_team: 'Lakers',
      away_team: 'Celtics',
      bookmakers: [
        {
          key: 'betfair_ex_eu',
          title: 'Betfair',
          markets: [
            {
              key: 'h2h_lay',
              outcomes: [
                { name: 'Lakers', price: 1.9 },
                { name: 'Celtics', price: 2.0 },
              ],
            },
            {
              key: 'h2h',
              outcomes: [
                { name: 'Lakers', price: 1.85 },
                { name: 'Celtics', price: 2.1 },
              ],
            },
          ],
        },
      ],
    };
    let matches: Match[] = [];

    api.getMatches('basketball_nba').subscribe((result) => (matches = result));
    http.expectOne((req) => req.url === '/api/v4/sports/basketball_nba/odds').flush([event]);

    expect(matches[0].bookmakers[0].odds).toEqual({ home: 1.85, draw: null, away: 2.1 });
  });

  it('leaves out outright competitions', () => {
    const sports: SportDto[] = [
      {
        key: 'soccer_epl',
        group: 'Soccer',
        title: 'EPL',
        description: 'English Premier League',
        has_outrights: false,
      },
      {
        key: 'soccer_fifa_world_cup_winner',
        group: 'Soccer',
        title: 'FIFA World Cup Winner',
        description: 'Outright winner',
        has_outrights: true,
      },
    ];
    let result: Sport[] = [];

    api.getSports().subscribe((list) => (result = list));
    http.expectOne('/api/v4/sports').flush(sports);

    expect(result.map((sport) => sport.key)).toEqual(['soccer_epl']);
  });
});
