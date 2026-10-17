import { Bookmaker, Match, Odds } from '../../core/models/match';

/** How many generated matches demo mode adds to the real API response. */
export const DEMO_MATCH_COUNT = 1000;

const DEMO_ID_PREFIX = 'demo-';
const DEMO_BOOKMAKER: Bookmaker = { key: 'demo', title: 'Demo bookmaker' };
const QUARTER_HOUR_MS = 15 * 60 * 1000;
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

const TEAMS = [
  'Bratislava',
  'Košice',
  'Žilina',
  'Trnava',
  'Nitra',
  'Prešov',
  'Banská Bystrica',
  'Trenčín',
  'Martin',
  'Poprad',
  'Praha',
  'Brno',
  'Ostrava',
  'Plzeň',
  'Olomouc',
  'Viedeň',
  'Graz',
  'Salzburg',
  'Budapešť',
  'Debrecín',
  'Krakov',
  'Varšava',
  'Gdansk',
  'Vroclav',
  'Ľubľana',
  'Záhreb',
  'Split',
  'Belehrad',
  'Sofia',
  'Bukurešť',
];

export function isDemoMatch(match: Match): boolean {
  return match.id.startsWith(DEMO_ID_PREFIX);
}

/**
 * Generates `count` random matches in the next two weeks, sorted by start time.
 * They use the given bookmakers so the bookmaker select keeps working.
 */
export function generateDemoMatches(
  count: number,
  sportKey: string,
  sportTitle: string,
  bookmakers: Bookmaker[],
): Match[] {
  const offered = bookmakers.length > 0 ? bookmakers : [DEMO_BOOKMAKER];
  const now = Date.now();

  const matches = Array.from({ length: count }, (_, index): Match => {
    const [homeTeam, awayTeam] = randomPair(TEAMS);
    const start = now + Math.random() * TWO_WEEKS_MS;

    return {
      id: `${DEMO_ID_PREFIX}${index + 1}`,
      sportKey,
      sportTitle,
      commenceTime: new Date(Math.ceil(start / QUARTER_HOUR_MS) * QUARTER_HOUR_MS).toISOString(),
      homeTeam,
      awayTeam,
      bookmakers: offered.map(({ key, title }) => ({ key, title, odds: randomOdds() })),
    };
  });

  return matches.sort((a, b) => a.commenceTime.localeCompare(b.commenceTime));
}

function randomPair(teams: string[]): [string, string] {
  const home = Math.floor(Math.random() * teams.length);
  let away = home;
  while (away === home) {
    away = Math.floor(Math.random() * teams.length);
  }
  return [teams[home], teams[away]];
}

function randomOdds(): Odds {
  return { home: randomPrice(), draw: randomPrice(), away: randomPrice() };
}

/** 1.00 to 5.00 with two decimals; about every tenth price is missing to show dashes too. */
function randomPrice(): number | null {
  if (Math.random() < 0.1) {
    return null;
  }
  return Math.round((1 + Math.random() * 4) * 100) / 100;
}
