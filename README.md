# Oddline · Športové kurzy

Angular aplikácia, ktorá zobrazuje športové súťaže, zápasy a kurzy 1 / X / 2 z [The Odds API v4](https://the-odds-api.com/liveapi/guides/v4/). Má vlastný tmavý dizajn Oddline, popis je v časti [Dizajn](#dizajn).

**Technológie:** Angular 22 (standalone komponenty, zoneless, signály, OnPush), NgRx Signal Store, Angular CDK (virtual scroll), Tailwind CSS 4, RxJS, TypeScript 6.

## Požiadavky

- Node.js 24.15 alebo novší (vyžaduje ho Angular 22) a npm
- API kľúč z [the-odds-api.com](https://the-odds-api.com), bezplatný plán stačí

## Spustenie

1. Nainštaluj závislosti:

   ```bash
   npm install
   ```

2. Vytvor súbor `.env` zo šablóny `.env.example`:

   ```bash
   cp .env.example .env
   ```

   Vo Windows PowerShelli:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Do `.env` doplň svoj kľúč, bez úvodzoviek a medzier:

   ```
   ODDS_API_KEY=tvoj_api_kluc
   ```

4. Spusti dev server a otvor `http://localhost:4200`:

   ```bash
   npm start
   ```

**Demo režim:** `http://localhost:4200/sports/soccer_epl?demo=true` pridá k reálnej odpovedi API 1 000 vygenerovaných zápasov, aby sa dal vyskúšať dlhý zoznam s virtual scrollom. Na stránke zápasov sa zapína a vypína aj odkazom pri nadpise.

## API kľúč

- Kľúč je v súbore `.env`, ktorý je v `.gitignore`. Funguje aj systémová premenná prostredia `ODDS_API_KEY`.
- Aplikácia volá iba relatívne adresy `/api/...`. Dev server ich cez [`proxy.conf.mjs`](proxy.conf.mjs) prepošle na `api.the-odds-api.com` a pridá kľúč. Kľúč sa tak nedostane do JavaScriptu v prehliadači ani do gitu.
- Bez kľúča (alebo s neplatným kľúčom) aplikácia zobrazí hlášku o probléme s API kľúčom.
- Spotreba kreditov: zoznam súťaží je zadarmo, každé otvorenie zoznamu zápasov alebo detailu zápasu stojí 1 kredit. Bezplatný plán má 500 kreditov mesačne. Live update kurzov API nevolá.
- Po zmene `.env` treba `npm start` reštartovať.

## Príkazy

| Príkaz                      | Čo robí                                                                      |
| --------------------------- | ---------------------------------------------------------------------------- |
| `npm start`                 | Dev server s proxy na `http://localhost:4200`                                |
| `npm run build`             | Produkčný build do `dist/`                                                   |
| `npm run lint`              | Kontrola kódu cez ESLint (angular-eslint)                                    |
| `npm test`                  | Unit testy (Vitest); v termináli sledujú zmeny súborov, ukončíš ich `Ctrl+C` |
| `npx ng test --watch=false` | Unit testy iba raz, bez sledovania zmien                                     |

### Testy

Testov je zámerne málo (4 súbory, 11 testov) a overujú logiku, ktorá sa môže pokaziť, nie vzhľad:

| Súbor                                    | Čo overuje                                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `core/api/odds-api.spec.ts`              | Kurzy 1/X/2 sa priradia podľa mena tímu v akomkoľvek poradí, chýbajúca remíza je `null`, `h2h_lay` sa ignoruje, outrights sa vyhodia |
| `features/matches/matches.store.spec.ts` | Staršia odpoveď neprepíše novšiu (`switchMap`), vyhľadávanie, predvolený bookmaker, Ďalší kurz s rovnakými hodnotami                 |
| `features/auth/login-page.spec.ts`       | Validácia emailu a hesla podľa zadania, uloží sa iba email a nasleduje presmerovanie na `/client`                                    |
| `core/auth/auth.guard.spec.ts`           | Neprihláseného presmeruje na `/login`, prihláseného pustí                                                                            |

HTTP sa v testoch nahrádza cez `HttpTestingController`, `OddsApi` v teste store falošným objektom. Animácie a virtual scroll závisia od prehliadača, preto patria do end-to-end testov.

## Stav zadania

| Časť                      | Stav   | Čo obsahuje                                                                                                                                                       |
| ------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Základ                    | Hotovo | Stránky Športy, Zápasy, Prihlásenie, Klient; načítavanie, prázdny výsledok a chyba s tlačidlom Skúsiť znova                                                       |
| A – Interakcie            | Hotovo | Detail zápasu so zvýraznením najvyššieho kurzu, Obľúbené, vyhľadávanie podľa tímu, výber bookmakera, tlačidlo Ďalší kurz                                          |
| B – Väčší dataset a stav  | Hotovo | Virtual scroll (CDK), demo režim s 1 000 zápasmi, stav dát, požiadaviek, filtrov a obľúbených v NgRx Signal Store, ochrana pred staršou odpoveďou                 |
| C – Live update kurzov    | Hotovo | Služba každé 2 s zmení 20 náhodných kurzov (1,00 – 5,00), zmena blikne na zeleno alebo na červeno so šípkou ▲/▼; zmeny sa dajú pozastaviť a v skrytej karte stoja |
| D – Technické rozhodnutia | Hotovo | Návrh v časti [Rozšírenie D](#rozšírenie-d-technické-rozhodnutia)                                                                                                 |
| Voliteľný tooling         | Hotovo | ESLint, 11 unit testov (Vitest) a pravidlá pre AI agenta v [`AGENTS.md`](AGENTS.md)                                                                               |
| Dizajn                    | Hotovo | Tmavý dizajn Oddline: tokeny v Tailwinde, vlastné písma, hlavička, pätička, mobilná lišta, všetky stránky                                                         |

## Architektúra

```
src/app/
  layout/         rám okolo každej stránky: Header, Footer, TabBar (mobil)
  core/
    api/          OddsApi: HTTP volania a prevod DTO z API na modely, chybové hlášky
    auth/         AuthStore (prihlásený email) a authGuard
    favorites/    FavoritesStore (obľúbené zápasy v localStorage)
    models/       Sport, Match, Odds, RequestStatus
  shared/ui/      prezentačné komponenty: Logo, LoadingState, ErrorState, EmptyState, OddsValue
  features/       jedna stránka = komponent + jej store
    sports/  matches/  match-detail/  favorites/  auth/
src/styles.css    dizajnové tokeny (@theme), písma, základné štýly, @utility
```

Dáta tečú jedným smerom: **stránka → store (NgRx Signal Store) → `OddsApi` → `/api` proxy → The Odds API**. Komponenty iba zobrazujú a posielajú akcie, stav mení iba store cez `patchState`.

Hlavné rozhodnutia:

- **Stav v NgRx Signal Store.** Zdieľané store-y (`SportsStore`, `AuthStore`, `FavoritesStore`) sú v `root`. Store jednej stránky (`MatchesStore`, `MatchDetailStore`) je v `providers` stránky a zanikne s ňou, vrátane intervalu live update.
- **Ochrana pred staršou odpoveďou.** Načítanie je `rxMethod` so `switchMap`: pri rýchlom prepnutí súťaže sa predchádzajúca požiadavka zruší a jej odpoveď neprepíše aktuálne dáta.
- **DTO → model.** Odpovede API sa hneď v `core/api` prevedú na modely aplikácie; chýbajúci kurz je `null` a zobrazí sa ako pomlčka.
- **Zoneless, OnPush, signály, `@if` / `@for`.** OnPush je v Angulari 22 predvolený, preto nie je nastavený v jednotlivých komponentoch. Jediná výnimka zo syntaxe `@for` je `*cdkVirtualFor`, ktorý nemá variant s `@for`.
- **Prihlásenie cez Signal Forms** (stabilné v Angulari 22). Do localStorage sa ukladá iba email, stránku `/client` chráni funkcionálny guard.
- **Virtual scroll** s pevnou výškou riadku (stabilná stratégia CDK): 80 px na desktope, 160 px na mobile, prepína ju `BreakpointObserver` pri tom istom breakpointe ako Tailwind. Z 1 000+ zápasov je v DOM-e naraz len okolo desiatich riadkov.
- **Bliknutie kurzov** cez `effect` a Web Animations API, farba aj šípka ▲/▼. Kľúč zápas:bookmaker:výsledok zabráni falošnému bliknutiu pri recyklácii riadkov a pri zmene bookmakera; rešpektuje sa `prefers-reduced-motion`.
- **Pauza live update.** Tlačidlo „Pozastaviť zmeny kurzov“ (obsah, ktorý sa sám obnovuje, musí ísť zastaviť, WCAG 2.2.2) a v skrytej karte sa zmeny nedejú (`document.visibilityState`). `OddsTicker` vtedy tik zahodí operátorom `filter`.

## Dizajn

Vizuálna identita **Oddline** podľa vlastného návrhu: tmavé rozhranie, jedna farba značky (volt) a kurzy v písme s rovnako širokými číslicami, aby sa pri zmene neposúvali.

- **Tokeny v CSS.** Farby, písma, veľkosti písma, rohy a žiara sú v bloku `@theme` v [`src/styles.css`](src/styles.css). Tailwind z nich robí triedy ako `bg-surface` alebo `text-volt`. Predvolená paleta Tailwindu je vypnutá, takže sa dajú použiť iba farby z návrhu.
- **Opakované kúsky** (`btn`, `btn-primary`, `btn-secondary`, `btn-ghost`, `field`, `card`) sú `@utility` v tom istom súbore. Tlačidlá a polia ostali natívne `<button>` a `<input>`.
- **Písma** Unbounded, Onest a JetBrains Mono sú v `public/fonts` (licencia SIL Open Font License 1.1), bez požiadavky na Google Fonts.
- **Mobil:** pod 640 px sa navigácia presunie do spodnej lišty a pod 768 px sa riadok zápasu skladá pod seba.
- **Prístupnosť:** kontrast textu aspoň 4,5 : 1, jeden viditeľný rámik fokusu, zmena kurzu má okrem farby aj šípku a pri `prefers-reduced-motion` sa vypne bliknutie aj animácia načítavania.

## Rozšírenie D: technické rozhodnutia

### 1. Statický web a API kľúč v `environment.ts`

Navrhujem to **nerobiť**. `environment.ts` sa pri builde skompiluje do JavaScriptu, ktorý si stiahne každý návštevník. Kľúč by bol verejne viditeľný v DevTools (v zdrojovom kóde aj v adrese každej požiadavky, lebo The Odds API ho chce ako query parameter) a ktokoľvek by mohol míňať naše kredity.

**Návrh:** frontend ostane statický, ale pribudne tenký serverový proxy, napríklad serverless funkcia (Cloudflare Worker, Netlify alebo Vercel Function):

- kľúč je uložený ako tajná premenná prostredia na serveri, nikdy nie v prehliadači,
- frontend volá tú istú adresu `/api/...` ako dnes, takže **kód aplikácie sa nemení**; pri vývoji túto úlohu plní `proxy.conf.mjs`,
- proxy môže odpovede krátko cachovať a obmedziť počet požiadaviek, aby počet používateľov nenásobil spotrebu kreditov.

Ak by produkt trval na čisto statickom webe bez servera, kľúč bude verejný. Zmierniť sa to dá iba čiastočne (samostatný kľúč s nízkym limitom, sledovanie spotreby, pravidelná výmena) a odporúčal by som to len na krátke demo.

### 2. Obnovovanie kurzov každé 2 sekundy na všetkých stránkach aj v neaktívnej karte

Navrhujem inú implementáciu, z troch dôvodov:

- **Kredity.** Jedno volanie `/odds` stojí 1 kredit. Interval 2 s znamená 30 volaní za minútu na každú otvorenú kartu, takže bezplatných 500 kreditov by jedna karta minula približne za 17 minút. Každý ďalší používateľ spotrebu násobí.
- **Neaktívne karty.** Prehliadače v kartách na pozadí zámerne brzdia časovače (Chrome najviac raz za sekundu, po 5 minútach na pozadí zhruba raz za minútu). Spoľahlivé obnovovanie každé 2 s sa z frontendu zaručiť nedá.
- **Všetky stránky.** Stránky ako Športy alebo Prihlásenie kurzy nezobrazujú, obnovovať ich nemá zmysel.

**Návrh:**

- Kurzy sťahuje **server raz pre všetkých** (ten istý proxy) v intervale dohodnutom s produktom podľa toho, ako často sa kurzy reálne menia, a zmeny posiela klientom cez **Server-Sent Events** alebo WebSocket.
- Klient pri skrytej karte (`document.visibilityState`, udalosť `visibilitychange`) aktualizácie pozastaví a po návrate si hneď načíta čerstvé dáta, takže používateľ nikdy nevidí staré kurzy. Pozastavenie v skrytej karte aplikácia robí už dnes so simulovanými kurzami.
- Aktualizácie bežia iba na stránkach s kurzami. Tak to funguje už dnes: live update žije v `MatchesStore` a zastaví sa s odchodom zo stránky.

V aplikácii je live update z rozšírenia C **simulovaný** (`OddsTicker`), aby nemíňal kredity. Pri skutočných aktualizáciách zo servera by sa v `OddsTicker` iba nahradil `interval(2000)` prúdom zo servera; store, nemenné úpravy stavu aj bliknutie ostanú bez zmeny.

## Známe obmedzenia

- Live update je simulácia: kurzy sa menia lokálne v prehliadači, iba pri zobrazenom bookmakerovi a iba na stránke zápasov.
- Proxy funguje iba s `npm start`. Produkčný build v `dist/` by potreboval serverový proxy z rozšírenia D.
- Prihlásenie je frontendová ukážka podľa zadania: heslo sa nikam neposiela ani neukladá, email je v localStorage.
- Obľúbené ukladajú zápas bez kurzov; skončené zápasy v nich ostanú a ich detail zobrazí hlášku, že zápas sa nenašiel.
- Demo zápasy nemajú detail ani tlačidlo obľúbených, lebo ich API nepozná.
- Riadok zoznamu zápasov má pevnú výšku (podmienka virtual scrollu), dlhé názvy tímov sa skracujú.
- Vyhľadávanie nerozlišuje veľké a malé písmená, ale rozlišuje diakritiku.
- Odpovede API sa necachujú, každé otvorenie zoznamu zápasov alebo detailu stojí kredit.
- Unit testy pokrývajú iba najdôležitejšiu logiku; bliknutie, virtual scroll a šablóny testované nie sú.
- Z návrhu dizajnu chýba vyhľadávanie súťaží, odznak „live“ a kontrolný zoznam pravidiel hesla. Boli by to nové funkcie mimo zadania.

## Čo by som riešil ďalej

- Ďalšie testy: `OddsTicker`, `FavoritesStore` (ukladanie do localStorage), detail zápasu.
- Serverový proxy s cache a Server-Sent Events podľa rozšírenia D.
- Vyhľadávanie bez ohľadu na diakritiku a samostatné hlášky pre prekročenie limitu (429) a výpadok pripojenia.
- End-to-end test hlavného toku (napríklad Playwright).
- Po odobratí zápasu na stránke Obľúbené presunúť fokus na ďalší riadok; teraz zmizne spolu s riadkom.
