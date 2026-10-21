// Dev-server proxy: the app calls `/api/...`, this Node process forwards the request
// to The Odds API and appends the API key. The key never reaches the browser bundle, git or logs.
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
    rewrite: (path) => path.replace(/^\/api/, ''),
    // The key is added only to the outgoing request: the dev server prints the rewritten URL
    // when the API cannot be reached, and that URL must not contain the key.
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        const url = new URL(proxyReq.path, 'http://localhost');
        url.searchParams.set('apiKey', apiKey ?? '');
        proxyReq.path = url.pathname + url.search;
      });
    },
  },
};
