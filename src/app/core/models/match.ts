/** Decimal odds for 1 / X / 2. `null` means the bookmaker does not offer that outcome. */
export interface Odds {
  home: number | null;
  draw: number | null;
  away: number | null;
}

export interface Bookmaker {
  key: string;
  title: string;
}

export interface BookmakerOdds extends Bookmaker {
  odds: Odds;
}

export interface Match {
  id: string;
  sportKey: string;
  sportTitle: string;
  /** ISO 8601 string, kept as text so it survives JSON (localStorage). */
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  bookmakers: BookmakerOdds[];
}
