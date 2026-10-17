import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Match, Odds } from '../models/match';
import { Sport } from '../models/sport';
import { BookmakerDto, EventDto, SportDto } from './odds-api.dto';

// Goes through the dev-server proxy (proxy.conf.mjs), which adds the API key.
const API_URL = '/api/v4';

// European bookmakers, 1/X/2 market, decimal odds: 1 API credit per request.
const ODDS_PARAMS = { regions: 'eu', markets: 'h2h', oddsFormat: 'decimal' };

@Service()
export class OddsApi {
  private readonly http = inject(HttpClient);

  getSports(): Observable<Sport[]> {
    return this.http
      .get<SportDto[]>(`${API_URL}/sports`)
      .pipe(map((sports) => sports.filter((sport) => !sport.has_outrights).map(toSport)));
  }

  getMatches(sportKey: string): Observable<Match[]> {
    return this.http
      .get<EventDto[]>(`${API_URL}/sports/${encodeURIComponent(sportKey)}/odds`, {
        params: ODDS_PARAMS,
      })
      .pipe(map((events) => events.map(toMatch)));
  }

  getMatch(sportKey: string, eventId: string): Observable<Match> {
    const sport = encodeURIComponent(sportKey);
    const event = encodeURIComponent(eventId);
    return this.http
      .get<EventDto>(`${API_URL}/sports/${sport}/events/${event}/odds`, { params: ODDS_PARAMS })
      .pipe(map(toMatch));
  }
}

function toSport(dto: SportDto): Sport {
  return {
    key: dto.key,
    group: dto.group,
    title: dto.title,
    description: dto.description,
  };
}

function toMatch(dto: EventDto): Match {
  return {
    id: dto.id,
    sportKey: dto.sport_key,
    sportTitle: dto.sport_title,
    commenceTime: dto.commence_time,
    homeTeam: dto.home_team,
    awayTeam: dto.away_team,
    bookmakers: dto.bookmakers.map((bookmaker) => ({
      key: bookmaker.key,
      title: bookmaker.title,
      odds: toOdds(bookmaker, dto),
    })),
  };
}

function toOdds(bookmaker: BookmakerDto, event: EventDto): Odds {
  // Exchanges also return an `h2h_lay` market, only the regular `h2h` one is wanted.
  const outcomes = bookmaker.markets.find((market) => market.key === 'h2h')?.outcomes ?? [];
  const priceOf = (name: string) =>
    outcomes.find((outcome) => outcome.name === name)?.price ?? null;

  return {
    home: priceOf(event.home_team),
    draw: priceOf('Draw'),
    away: priceOf(event.away_team),
  };
}
