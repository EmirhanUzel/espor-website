# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server on port 5175 with HMR
npm run build    # Production build (outputs to dist/)
npm run lint     # ESLint (flat config, jsx files)
npm run preview  # Preview production build locally
```

No test suite — there are no test files in this project.

## Environment Variables

Create a `.env.local` file with:
```
VITE_LIQUIPEDIA_API_KEY=...
VITE_PANDASCORE_API_KEY=...
```

The Vite dev server proxies `/liquipedia-api` → `https://api.liquipedia.net/api/v3` and injects the auth header server-side. Without these keys, CS2 data falls back to the mock layer in `src/services/api.js`.

## Architecture

**Stack:** React 19, React Router v7, Vite 8. No backend — all data is mocked client-side in `src/services/`, with optional real API calls for CS2.

**Routing:** All routes are defined in `src/App.jsx`. Route paths follow the pattern `/entity` (list) and `/entity/:id` (detail). Auto-scrolls to top on navigation.

**`wiki` prop:** `App.jsx` holds `wiki` state (`"valorant"` | `"counterstrike"` | `"leagueoflegends"`) and `region` state, set by the Navbar dropdown. Both are passed as props to pages that need to filter by game. Pages that are game-agnostic (e.g. `/forum`, `/profile`) don't receive `wiki`.

**State:** Context API only (no Redux/Zustand).
- `src/contexts/LanguageContext.jsx` — EN/TR i18n, persisted to localStorage. All UI text must use `useLanguage().t('key')` and have entries in `src/i18n/translations.js`.
- `src/contexts/ThemeContext.jsx` — Light/dark mode, persisted to localStorage. Dark mode is applied as a `.dark` class on `<html>`.
- `src/services/auth.jsx` — Frontend-only demo auth, localStorage-persisted.

**Styling:** CSS Modules (`.module.css` per component/page). No Tailwind. Theme tokens are CSS variables defined in `src/index.css`. Responsive breakpoint is 768px. The `.wrap` utility class sets `max-width: 1280px` with auto margins. Never hardcode hex values — use the CSS variables (`--bg`, `--text-1`, `--surface`, `--border`, etc.).

**Data layer:**
- `src/services/api.js` — mock Liquipedia-style data for all three games (tournaments, matches, players, teams, news, transfers). Source of truth when real APIs are unavailable.
- `src/services/liquipediaApi.js` — real Liquipedia API v3, CS2 only. Has a serial request queue (1.1s between requests) and two-layer cache: in-memory (10 min) + localStorage (30 min). Backs off 30 min after a 429/403.
- `src/services/pandascoreApi.js` — PandaScore API for CS2 player stats. Direct browser fetch (CORS enabled), token appended as query param, localStorage cache (1 hour).
- `src/services/xApi.js` — X (Twitter) API v2 search via Vite proxy. Requires `VITE_X_BEARER_TOKEN` (X Basic tier, $100/mo). Currently built but not wired to any page.
- `src/services/forum.js` — localStorage-backed forum posts/replies with seed data.
- `src/services/playerStats.js` — static player match history dataset.

## Key Conventions

- Every new page gets a paired `PageName.module.css` in `src/pages/`.
- Every new component gets a paired `ComponentName.module.css` in `src/components/`.
- New UI strings need entries in both `en` and `tr` objects in `src/i18n/translations.js`.
- Use `getFlag(nationality)` from `src/services/api.js` for flag emojis. Use `formatDate`, `formatPrize`, `tierLabel` from the same file.

## Coding Guidelines

1. **Think Before Coding** — State assumptions explicitly. If multiple interpretations exist, present them. If something is unclear, stop and ask.

2. **Simplicity First** — Minimum code that solves the problem. No features beyond what was asked. No abstractions for single-use code. If you write 200 lines and it could be 50, rewrite it.

3. **Surgical Changes** — Touch only what you must. Don't improve adjacent code or formatting. Match existing style. Every changed line should trace directly to the request.

4. **Goal-Driven Execution** — Define success criteria before implementing. For multi-step tasks, state a brief plan with verifiable steps.

## Environment Variables (full list)

```
VITE_LIQUIPEDIA_API_KEY=...     # Liquipedia API v3 — CS2/LoL data
VITE_PANDASCORE_API_KEY=...     # PandaScore — CS2 player stats
VITE_FACEIT_API_KEY=...         # FACEIT — player stats
VITE_GRID_API_KEY=...           # GRID — esports data
VITE_X_BEARER_TOKEN=...         # X API v2 Basic tier — tweet search (optional)
```

Vite dev server proxies: `/liquipedia-api`, `/pandascore`, `/faceit-api`, `/grid-api`, `/x-api`, `/lolesports-api`, `/lolesports-gpr`.

## MatchPage (`src/pages/MatchPage.jsx`)

The match detail page has three wiki branches: `counterstrike`, `leagueoflegends`, and generic.

### CS2 match page components

| Component | Purpose |
|---|---|
| `VetoBoard` | Map veto list. 2-col grid; each item has a background map image (opacity 0.18) from `CS2_MAP_IMG`. Decider spans both columns. |
| `CsMapPanel` | Per-map tab panel. Shows `HalftimePanel` (CT/T half breakdown from `extradata`) + `PlayerStatTable`. |
| `PlayerStatTable` | K/D/A/KD/ADR/Rating/HS% table. Player names link to `/player/:id`. Avatars via `PlayerAvatarImg`. |
| `PlayerAvatarImg` | Fetches player photo from Liquipedia MediaWiki parse API (`getCS2PlayerImage`). Falls back to letter avatar. 24h localStorage cache. |
| `MatchVideos` | Per-map VOD cards from `match2games[].vod` + `getCS2MatchVods`. YouTube thumbnail auto-extracted; harita görseli fallback. Hidden if no VODs. |
| `H2HSection` | Last 5 head-to-head matches via `getCS2H2HMatches`. Single-row cards: team logos + score + tournament + date. |

### CS2 mock overlay (`MOCK_MATCH_STATS` in `api.js`)

Keyed by Liquipedia `match2id`. Overlays real API data (logos, scores) with:
- `veto` — map ban/pick order (not in Liquipedia API)
- `games[].playerStats` — HLTV player K/D/ADR/Rating stats (Liquipedia CS2 `participants` is always empty)

Only match implemented: `"Ffcq6omMBC_R01-M003"` (MOUZ 2–0 Aurora Gaming, BLAST Premier 2026-05-15).

### Map images

```js
const GH = 'https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/thumbs';
const CS2_MAP_IMG = { 'Dust2': `${GH}/de_dust2_1_png.png`, ... };
```

Same URLs used in `TeamPage.jsx` (`MAP_BANNERS`). Keys: `Ancient`, `Anubis`, `Dust2`, `Dust II`, `Inferno`, `Mirage`, `Nuke`, `Overpass`, `Vertigo`, `Train`, `Cache`.

### New `liquipediaApi.js` exports (appended at end of file)

- `getCS2H2HMatches(team1, team2, limit=5)` — recent finished matches where both teams are opponents
- `getCS2TournamentImage(pagename)` — tournament banner via MediaWiki parse API, 24h cache
- `getCS2MatchVods(matchId)` — VOD links from `matchvod` table

### ⚠️ liquipediaApi.js encoding issue

The file has **CRLF line endings + UTF-8 mojibake** (e.g. `→` renders as `â†'`). The `Edit` tool cannot match strings reliably. Always use **Node.js `.cjs` scripts** to modify this file:

```js
// fix_something.cjs
const fs = require('fs');
const content = fs.readFileSync('src/services/liquipediaApi.js', 'utf8');
// ... string operations ...
fs.writeFileSync('src/services/liquipediaApi.js', modified);
```

Run with `node fix_something.cjs`, then delete the script. Never use bash `[[` or `]]` in Node.js template literals run from shell — the shell interprets them as test operators.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
