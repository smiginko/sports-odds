// Shape of The Odds API v4 responses (https://the-odds-api.com/liveapi/guides/v4/).
// Only the fields the app reads are typed. Used only inside core/api.

export interface SportDto {
  key: string;
  group: string;
  title: string;
  description: string;
  has_outrights: boolean;
}

export interface OutcomeDto {
  name: string;
  price: number;
}

export interface MarketDto {
  key: string;
  outcomes: OutcomeDto[];
}

export interface BookmakerDto {
  key: string;
  title: string;
  markets: MarketDto[];
}

export interface EventDto {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: BookmakerDto[];
}
