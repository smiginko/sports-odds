// Dev-server proxy: the app calls `/api/...`, this Node process forwards the request
// to The Odds API and appends the API key. The key never reaches the browser bundle or git.
import { existsSync } from 'node:fs';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const apiKey = process.env['ODDS_API_KEY'];

if (!apiKey) {
  console.warn('[proxy] ODDS_API_KEY is not set, The Odds API will answer 401. See README.');
}

export default {
  '/api': {
    target: 'https://api.the-odds-api.com',
    changeOrigin: true,
    rewrite: (path) => {
      const url = new URL(path.replace(/^\/api/, ''), 'http://localhost');
      url.searchParams.set('apiKey', apiKey ?? '');
      return url.pathname + url.search;
    },
  },
};
